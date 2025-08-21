import { Message } from '../builders/Message';
import { Embed } from '../builders/Embed';
import { MessageSchema } from '../validation/message.validation';
import axios, { AxiosInstance } from 'axios';
import { Request } from './Request';
import * as fs from 'fs';
import FormData from 'form-data';
import { DISCORD_COLORS } from '../constants/colors';
import {
  WebhookError,
  ValidationError,
  RequestError,
  FileSystemError,
} from '../errors';
import { ZodError } from 'zod';

export class Webhook {
  private webhookId: string;
  private webhookToken: string;
  private messages: Message[] = [];
  private requestClient: Request;
  private axiosInstance: AxiosInstance;

  /**
   * Creates a new Webhook instance.
   * @param url The full Discord webhook URL.
   * @throws {WebhookError} If the webhook URL is invalid or empty.
   */
  constructor(url: string) {
    const parts = url.split('/');
    if (parts.length < 2) {
      // Basic validation
      throw new WebhookError('Invalid Webhook URL provided.', 'INVALID_URL');
    }
    this.webhookId = parts[parts.length - 2];
    this.webhookToken = parts[parts.length - 1];

    this.axiosInstance = axios.create({
      baseURL: `https://discord.com/api/webhooks/${this.webhookId}/${this.webhookToken}`,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    this.requestClient = new Request(this.axiosInstance);
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
   * Sends all messages currently in the queue.
   * Messages are sent sequentially. If a message fails to send, it remains in the queue,
   * and the method will throw an error after attempting to send all messages.
   * @throws {ValidationError} If any message fails Zod validation.
   * @throws {RequestError} If any message fails to send due to a network or Discord API error.
   * @throws {WebhookError} For other unexpected errors during the sending process.
   */
  public async send() {
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
    const errors: unknown[] = [];

    for (const message of this.messages) {
      try {
        await this._sendOne(message);
      } catch (error) {
        remainingMessages.push(message);
        errors.push(error);
      }
    }

    this.messages = remainingMessages;

    if (errors.length > 0) {
      const errorMessages = errors
        .map((err) => (err instanceof Error ? err.message : String(err)))
        .join('\n');
      throw new WebhookError(
        `Failed to send ${errors.length} messages. Details:\n${errorMessages}`,
        'BATCH_SEND_FAILURE'
      );
    }
  }

  private async _sendOne(message: Message) {
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

    await this.requestClient.send(
      method,
      payload,
      {
        'Content-Type': 'application/json',
      },
      url
    );
  }

  /**
   * Sends a file to the webhook.
   * @param filePath The path to the file to send.
   * @param message An optional Message object to send along with the file.
   * @throws {FileSystemError} If the file cannot be read.
   * @throws {ValidationError} If the message payload fails Zod validation.
   * @throws {RequestError} If the file sending fails due to a network or Discord API error.
   * @throws {WebhookError} For other unexpected errors during the file sending process.
   */
  public async sendFile(filePath: string, message?: Message) {
    const form = new FormData();

    // Append the file stream
    try {
      fs.accessSync(filePath, fs.constants.R_OK);
      form.append('files[0]', fs.createReadStream(filePath));
    } catch (error) {
      throw new FileSystemError(
        `Cannot read file at path: ${filePath}. Original error: ${String(error)}`,
        'FILE_READ_ERROR'
      );
    }

    // If a message is provided, append its JSON payload
    if (message) {
      const payload = message.getPayload();
      // Validate the message payload before sending
      try {
        MessageSchema.parse(payload);
      } catch (error) {
        if (error instanceof ZodError) {
          throw new ValidationError(
            'Invalid message payload provided for file attachment.',
            error.issues
          );
        } else {
          throw new WebhookError(
            `An unexpected error occurred during file message validation: ${String(error)}`
          );
        }
      }
      form.append('payload_json', JSON.stringify(payload));
    }

    // Send using the Request client
    // axios will automatically set Content-Type: multipart/form-data with boundary
    await this.requestClient.send('POST', form);
  }

  /**
   * Sends an informational message with a blue embed.
   * @param title The title of the embed.
   * @param description The description of the embed (optional).
   * @throws {ValidationError} If the generated message payload fails Zod validation.
   * @throws {RequestError} If the message fails to send due to a network or Discord API error.
   * @throws {WebhookError} For other unexpected errors.
   */
  public async info(title: string, description?: string) {
    const embed = new Embed().setTitle(title).setColor(DISCORD_COLORS.INFO);
    if (description) embed.setDescription(description);
    const message = new Message({ embeds: [embed] });
    try {
      await this._sendOne(message);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError(
          'Invalid info message payload.',
          error.issues
        );
      } else if (error instanceof RequestError) {
        throw error; // Re-throw RequestError directly
      } else {
        throw new WebhookError(
          `An unexpected error occurred sending info message: ${String(error)}`
        );
      }
    }
  }

  /**
   * Sends a success message with a green embed.
   * @param title The title of the embed.
   * @param description The description of the embed (optional).
   * @throws {ValidationError} If the generated message payload fails Zod validation.
   * @throws {RequestError} If the message fails to send due to a network or Discord API error.
   * @throws {WebhookError} For other unexpected errors.
   */
  public async success(title: string, description?: string) {
    const embed = new Embed().setTitle(title).setColor(DISCORD_COLORS.SUCCESS);
    if (description) embed.setDescription(description);
    const message = new Message({ embeds: [embed] });
    try {
      await this._sendOne(message);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError(
          'Invalid success message payload.',
          error.issues
        );
      } else if (error instanceof RequestError) {
        throw error; // Re-throw RequestError directly
      } else {
        throw new WebhookError(
          `An unexpected error occurred sending success message: ${String(error)}`
        );
      }
    }
  }

  /**
   * Sends a warning message with a yellow embed.
   * @param title The title of the embed.
   * @param description The description of the embed (optional).
   * @throws {ValidationError} If the generated message payload fails Zod validation.
   * @throws {RequestError} If the message fails to send due to a network or Discord API error.
   * @throws {WebhookError} For other unexpected errors.
   */
  public async warning(title: string, description?: string) {
    const embed = new Embed().setTitle(title).setColor(DISCORD_COLORS.WARNING);
    if (description) embed.setDescription(description);
    const message = new Message({ embeds: [embed] });
    try {
      await this._sendOne(message);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError(
          'Invalid warning message payload.',
          error.issues
        );
      } else if (error instanceof RequestError) {
        throw error; // Re-throw RequestError directly
      } else {
        throw new WebhookError(
          `An unexpected error occurred sending warning message: ${String(error)}`
        );
      }
    }
  }

  /**
   * Sends an error message with a red embed.
   * @param title The title of the embed.
   * @param description The description of the embed (optional).
   * @throws {ValidationError} If the generated message payload fails Zod validation.
   * @throws {RequestError} If the message fails to send due to a network or Discord API error.
   * @throws {WebhookError} For other unexpected errors.
   */
  public async error(title: string, description?: string) {
    const embed = new Embed().setTitle(title).setColor(DISCORD_COLORS.ERROR);
    if (description) embed.setDescription(description);
    const message = new Message({ embeds: [embed] });
    try {
      await this._sendOne(message);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError(
          'Invalid error message payload.',
          error.issues
        );
      } else if (error instanceof RequestError) {
        throw error; // Re-throw RequestError directly
      } else {
        throw new WebhookError(
          `An unexpected error occurred sending error message: ${String(error)}`
        );
      }
    }
  }

  /**
   * Deletes a previously sent webhook message.
   * @param messageLinkOrId The full message link (e.g., from Discord UI) or just the message ID of the message to delete.
   * @throws {RequestError} If the deletion fails due to a network or Discord API error.
   * @throws {WebhookError} For other unexpected errors during deletion.
   */
  public async delete(messageLinkOrId: string) {
    let messageId: string;
    const messageIdMatch = messageLinkOrId.match(/\/([0-9]+)$/);
    if (messageIdMatch) {
      messageId = messageIdMatch[1];
    } else {
      messageId = messageLinkOrId; // Assume it's just the ID if not a link
    }

    const url = `/messages/${messageId}`;

    try {
      await this.requestClient.send(
        'DELETE',
        undefined,
        { 'Content-Type': 'application/json' },
        url
      );
    } catch (error) {
      if (error instanceof RequestError) {
        throw error; // Re-throw RequestError directly
      } else {
        throw new WebhookError(
          `An unexpected error occurred during message deletion: ${String(error)}`
        );
      }
    }
  }
}
