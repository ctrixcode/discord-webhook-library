import { Message } from '../builders/Message';
import { Embed } from '../builders/Embed';
import { MessageSchema } from '../validation/message.validation';
import axios, { AxiosInstance } from 'axios';
import { Request } from './Request';
import * as fs from 'fs';
import FormData from 'form-data';
import { DISCORD_COLORS } from '../constants/colors';
import { WebhookError, ValidationError, FileSystemError } from '../errors';
import { ZodError } from 'zod';

interface WebhookInstance {
  id: string;
  token: string;
  url: string;
  axiosInstance: AxiosInstance;
}

export class Webhook {
  private webhooks: WebhookInstance[] = [];
  private messages: Message[] = [];

  /**
   * Creates a new Webhook instance.
   * @param url The full Discord webhook URL or an array of URLs.
   * @throws {WebhookError} If any webhook URL is invalid or empty.
   */
  constructor(url: string | string[]) {
    const urls = Array.isArray(url) ? url : [url];
    urls.forEach((u) => this.addWebhookUrl(u));
  }

  /**
   * Adds a webhook URL to the instance.
   * @param url The full Discord webhook URL.
   * @throws {WebhookError} If the webhook URL is invalid or empty.
   */
  public addWebhookUrl(url: string) {
    const parts = url.split('/');
    if (parts.length < 2) {
      throw new WebhookError('Invalid Webhook URL provided.', 'INVALID_URL');
    }
    const webhookId = parts[parts.length - 2];
    const webhookToken = parts[parts.length - 1];

    const axiosInstance = axios.create({
      baseURL: `https://discord.com/api/webhooks/${webhookId}/${webhookToken}`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.webhooks.push({
      id: webhookId,
      token: webhookToken,
      url: url,
      axiosInstance: axiosInstance,
    });
  }

  /**
   * Returns the number of configured webhook URLs.
   * @returns The number of webhook URLs.
   */
  public getWebhookCount(): number {
    return this.webhooks.length;
  }

  /**
   * Returns an array of all configured webhook URLs.
   * @returns An array of webhook URLs.
   **/
  public getWebhookUrls(): string[] {
    return this.webhooks.map((webhook) => webhook.url);
  }

  /**
   * Adds a message to the webhook's queue for batch sending.
   * @param message The Message object to add to the queue.
   * @returns The current Webhook instance.
   */
  public addMessage(message: Message) {
    this.messages.push(message);
    return this;
  }

  /**
   * Clears all messages from the webhook's queue.
   * @returns The current Webhook instance.
   */
  public clearMessages() {
    this.messages = [];
    return this;
  }

  /**
   * Returns an array of JSON payloads for all messages currently in the queue.
   * This is useful for inspecting the payload before sending.
   * @returns An array of plain objects representing the message payloads.
   */
  public getPayloads(): Record<string, unknown>[] {
    return this.messages.map((message) => message.getPayload());
  }

  /**
   * Sends all messages currently in the queue to all configured webhooks.
   * Messages are sent sequentially to each webhook. If a message fails to send to any webhook,
   * it remains in the queue, and the method will throw an error after attempting to send all messages
   * to all webhooks.
   * @throws {ValidationError} If any message fails Zod validation.
   * @throws {RequestError} If any message fails to send due to a network or Discord API error.
   * @throws {WebhookError} For other unexpected errors during the sending process.
   */
  public async send() {
    if (this.webhooks.length === 0) {
      throw new WebhookError('No webhook URLs configured.', 'NO_WEBHOOK_URLS');
    }

    // First, validate all message payloads.
    // This will throw a ValidationError immediately if any are invalid.
    for (const message of this.messages) {
      try {
        MessageSchema.parse(message.getPayload());
      } catch (error) {
        if (error instanceof ZodError) {
          throw new ValidationError(
            'Invalid message payload provided.',
            error.issues
          );
        } else {
          throw new WebhookError(
            `An unexpected error occurred during validation: ${String(error)}`
          );
        }
      }
    }

    const remainingMessages: Message[] = [];
    const allErrors: unknown[] = [];

    for (const webhookInstance of this.webhooks) {
      const requestClient = new Request(webhookInstance.axiosInstance);
      for (const message of this.messages) {
        try {
          await this._sendOne(message, requestClient);
        } catch (error) {
          remainingMessages.push(message); // Keep message in queue if it failed for any webhook
          allErrors.push(error);
        }
      }
    }

    this.messages = remainingMessages;

    if (allErrors.length > 0) {
      const errorMessages = allErrors
        .map((err) => (err instanceof Error ? err.message : String(err)))
        .join('\n');
      throw new WebhookError(
        `Failed to send ${allErrors.length} messages to one or more webhooks. Details:\n${errorMessages}`,
        'BATCH_SEND_FAILURE'
      );
    }
  }

  private async _sendOne(message: Message, requestClient: Request) {
    const payload = message.getPayload();

    let url = '';
    let method: 'POST' | 'PATCH' = 'POST';

    if (message.editTarget) {
      let messageId: string;
      const messageIdMatch = message.editTarget.match(/\/([0-9]+)$/);
      if (messageIdMatch) {
        messageId = messageIdMatch[1];
      } else {
        // Assume it's just the ID if not a link
        messageId = message.editTarget;
      }
      url = `/messages/${messageId}`;
      method = 'PATCH';
    }

    await requestClient.send(
      method,
      payload,
      {
        'Content-Type': 'application/json',
      },
      url === '' ? undefined : url
    );
  }

  /**
   * Sends a file to all configured webhooks.
   * @param filePath The path to the file to send.
   * @param message An optional Message object to send along with the file.
   * @throws {FileSystemError} If the file cannot be read.
   * @throws {ValidationError} If the message payload fails Zod validation.
   * @throws {RequestError} If the file sending fails due to a network or Discord API error.
   * @throws {WebhookError} For other unexpected errors during the file sending process.
   */
  public async sendFile(filePath: string, message?: Message) {
    if (this.webhooks.length === 0) {
      throw new WebhookError('No webhook URLs configured.', 'NO_WEBHOOK_URLS');
    }

    const allErrors: unknown[] = [];

    for (const webhookInstance of this.webhooks) {
      const form = new FormData();

      // Append the file stream
      try {
        fs.accessSync(filePath, fs.constants.R_OK);
        form.append('files[0]', fs.createReadStream(filePath));
      } catch (error) {
        allErrors.push(
          new FileSystemError(
            `Cannot read file at path: ${filePath}. Original error: ${String(error)}`,
            'FILE_READ_ERROR'
          )
        );
        continue; // Skip to next webhook if file cannot be read for this one
      }

      // If a message is provided, append its JSON payload
      if (message) {
        const payload = message.getPayload();
        // Validate the message payload before sending
        try {
          MessageSchema.parse(payload);
        } catch (error) {
          if (error instanceof ZodError) {
            allErrors.push(
              new ValidationError(
                'Invalid message payload provided for file attachment.',
                error.issues
              )
            );
          } else {
            allErrors.push(
              new WebhookError(
                `An unexpected error occurred during file message validation: ${String(error)}`
              )
            );
          }
          continue; // Skip to next webhook if message validation fails
        }
        form.append('payload_json', JSON.stringify(payload));
      }

      // Send using a new Request client for each webhook
      const requestClient = new Request(webhookInstance.axiosInstance);
      try {
        await requestClient.send('POST', form);
      } catch (error) {
        allErrors.push(error);
      }
    }

    if (allErrors.length > 0) {
      const errorMessages = allErrors
        .map((err) => (err instanceof Error ? err.message : String(err)))
        .join('\n');
      throw new WebhookError(
        `Failed to send file to one or more webhooks. Details:\n${errorMessages}`,
        'FILE_SEND_FAILURE'
      );
    }
  }

  /**
   * Sends an informational message with a blue embed to all configured webhooks.
   * @param title The title of the embed.
   * @param description The description of the embed (optional).
   * @throws {ValidationError} If the generated message payload fails Zod validation.
   * @throws {RequestError} If the message fails to send due to a network or Discord API error.
   * @throws {WebhookError} For other unexpected errors.
   */
  public async info(title: string, description?: string) {
    if (this.webhooks.length === 0) {
      throw new WebhookError('No webhook URLs configured.', 'NO_WEBHOOK_URLS');
    }
    const embed = new Embed().setTitle(title).setColor(DISCORD_COLORS.INFO);
    if (description) embed.setDescription(description);
    const message = new Message({ embeds: [embed] });

    const allErrors: unknown[] = [];
    for (const webhookInstance of this.webhooks) {
      const requestClient = new Request(webhookInstance.axiosInstance);
      try {
        await this._sendOne(message, requestClient);
      } catch (error) {
        allErrors.push(error);
      }
    }

    if (allErrors.length > 0) {
      const errorMessages = allErrors
        .map((err) => (err instanceof Error ? err.message : String(err)))
        .join('\n');
      throw new WebhookError(
        `Failed to send info message to one or more webhooks. Details:\n${errorMessages}`,
        'INFO_SEND_FAILURE'
      );
    }
  }

  /**
   * Sends a success message with a green embed to all configured webhooks.
   * @param title The title of the embed.
   * @param description The description of the embed (optional).
   * @throws {ValidationError} If the generated message payload fails Zod validation.
   * @throws {RequestError} If the message fails to send due to a network or Discord API error.
   * @throws {WebhookError} For other unexpected errors.
   */
  public async success(title: string, description?: string) {
    if (this.webhooks.length === 0) {
      throw new WebhookError('No webhook URLs configured.', 'NO_WEBHOOK_URLS');
    }
    const embed = new Embed().setTitle(title).setColor(DISCORD_COLORS.SUCCESS);
    if (description) embed.setDescription(description);
    const message = new Message({ embeds: [embed] });

    const allErrors: unknown[] = [];
    for (const webhookInstance of this.webhooks) {
      const requestClient = new Request(webhookInstance.axiosInstance);
      try {
        await this._sendOne(message, requestClient);
      } catch (error) {
        allErrors.push(error);
      }
    }

    if (allErrors.length > 0) {
      const errorMessages = allErrors
        .map((err) => (err instanceof Error ? err.message : String(err)))
        .join('\n');
      throw new WebhookError(
        `Failed to send success message to one or more webhooks. Details:\n${errorMessages}`,
        'SUCCESS_SEND_FAILURE'
      );
    }
  }

  /**
   * Sends a warning message with a yellow embed to all configured webhooks.
   * @param title The title of the embed.
   * @param description The description of the embed (optional).
   * @throws {ValidationError} If the generated message payload fails Zod validation.
   * @throws {RequestError} If the message fails to send due to a network or Discord API error.
   * @throws {WebhookError} For other unexpected errors.
   */
  public async warning(title: string, description?: string) {
    if (this.webhooks.length === 0) {
      throw new WebhookError('No webhook URLs configured.', 'NO_WEBHOOK_URLS');
    }
    const embed = new Embed().setTitle(title).setColor(DISCORD_COLORS.WARNING);
    if (description) embed.setDescription(description);
    const message = new Message({ embeds: [embed] });

    const allErrors: unknown[] = [];
    for (const webhookInstance of this.webhooks) {
      const requestClient = new Request(webhookInstance.axiosInstance);
      try {
        await this._sendOne(message, requestClient);
      } catch (error) {
        allErrors.push(error);
      }
    }

    if (allErrors.length > 0) {
      const errorMessages = allErrors
        .map((err) => (err instanceof Error ? err.message : String(err)))
        .join('\n');
      throw new WebhookError(
        `Failed to send warning message to one or more webhooks. Details:\n${errorMessages}`,
        'WARNING_SEND_FAILURE'
      );
    }
  }

  /**
   * Sends an error message with a red embed to all configured webhooks.
   * @param title The title of the embed.
   * @param description The description of the embed (optional).
   * @throws {ValidationError} If the generated message payload fails Zod validation.
   * @throws {RequestError} If the message fails to send due to a network or Discord API error.
   * @throws {WebhookError} For other unexpected errors.
   */
  public async error(title: string, description?: string) {
    if (this.webhooks.length === 0) {
      throw new WebhookError('No webhook URLs configured.', 'NO_WEBHOOK_URLS');
    }
    const embed = new Embed().setTitle(title).setColor(DISCORD_COLORS.ERROR);
    if (description) embed.setDescription(description);
    const message = new Message({ embeds: [embed] });

    const allErrors: unknown[] = [];
    for (const webhookInstance of this.webhooks) {
      const requestClient = new Request(webhookInstance.axiosInstance);
      try {
        await this._sendOne(message, requestClient);
      } catch (error) {
        allErrors.push(error);
      }
    }

    if (allErrors.length > 0) {
      const errorMessages = allErrors
        .map((err) => (err instanceof Error ? err.message : String(err)))
        .join('\n');
      throw new WebhookError(
        `Failed to send error message to one or more webhooks. Details:\n${errorMessages}`,
        'ERROR_SEND_FAILURE'
      );
    }
  }

  /**
   * Deletes a previously sent webhook message from all configured webhooks.
   * @param messageLinkOrId The full message link (e.g., from Discord UI) or just the message ID of the message to delete.
   * @throws {RequestError} If the deletion fails due to a network or Discord API error.
   * @throws {WebhookError} For other unexpected errors during deletion.
   */
  public async delete(messageLinkOrId: string) {
    if (this.webhooks.length === 0) {
      throw new WebhookError('No webhook URLs configured.', 'NO_WEBHOOK_URLS');
    }

    let messageId: string;
    const messageIdMatch = messageLinkOrId.match(/\/([0-9]+)$/);
    if (messageIdMatch) {
      messageId = messageIdMatch[1];
    } else {
      messageId = messageLinkOrId; // Assume it's just the ID if not a link
    }

    const url = `/messages/${messageId}`;
    const allErrors: unknown[] = [];

    for (const webhookInstance of this.webhooks) {
      const requestClient = new Request(webhookInstance.axiosInstance);
      try {
        await requestClient.send(
          'DELETE',
          undefined,
          { 'Content-Type': 'application/json' },
          url
        );
      } catch (error) {
        allErrors.push(error);
      }
    }

    if (allErrors.length > 0) {
      const errorMessages = allErrors
        .map((err) => (err instanceof Error ? err.message : String(err)))
        .join('\n');
      throw new WebhookError(
        `Failed to delete message from one or more webhooks. Details:\n${errorMessages}`,
        'DELETE_MESSAGE_FAILURE'
      );
    }
  }
}
