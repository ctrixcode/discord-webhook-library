import { Message } from '../builders/Message';
import { Embed } from '../builders/Embed';
import { MessageSchema } from '../validation/message.validation';
import axios, { AxiosInstance } from 'axios';
import { Request } from './Request';
import * as fs from 'fs';
import FormData from 'form-data';
import { DISCORD_COLORS } from '../constants/colors';

export class Webhook {
  private webhookId: string;
  private webhookToken: string;
  private messages: Message[] = [];
  private requestClient: Request;
  private axiosInstance: AxiosInstance;

  /**
   * Creates a new Webhook instance.
   * @param url The full Discord webhook URL.
   * @throws {Error} If the webhook URL is invalid or empty.
   */
  constructor(url: string) {
    const parts = url.split('/');
    if (parts.length < 2) {
      // Basic validation
      throw new Error('Invalid Webhook URL provided.');
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
   * @throws {Error} If any message fails to send. The error message will indicate the number of failures.
   */
  public async send() {
    // First, validate all message payloads.
    // This will throw a ZodError immediately if any are invalid.
    for (const message of this.messages) {
      MessageSchema.parse(message.getPayload());
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
      throw new Error(
        `Failed to send ${errors.length} messages. Details:\n${errorMessages}`
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
   * @throws {Error} If the file sending fails.
   */
  public async sendFile(filePath: string, message?: Message) {
    const form = new FormData();

    // Append the file stream
    form.append('files[0]', fs.createReadStream(filePath));

    // If a message is provided, append its JSON payload
    if (message) {
      const payload = message.getPayload();
      // Validate the message payload before sending
      MessageSchema.parse(payload);
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
   */
  public async info(title: string, description?: string) {
    const embed = new Embed().setTitle(title).setColor(DISCORD_COLORS.INFO);
    if (description) embed.setDescription(description);
    const message = new Message({ embeds: [embed] });
    await this._sendOne(message);
  }

  /**
   * Sends a success message with a green embed.
   * @param title The title of the embed.
   * @param description The description of the embed (optional).
   */
  public async success(title: string, description?: string) {
    const embed = new Embed().setTitle(title).setColor(DISCORD_COLORS.SUCCESS);
    if (description) embed.setDescription(description);
    const message = new Message({ embeds: [embed] });
    await this._sendOne(message);
  }

  /**
   * Sends a warning message with a yellow embed.
   * @param title The title of the embed.
   * @param description The description of the embed (optional).
   */
  public async warning(title: string, description?: string) {
    const embed = new Embed().setTitle(title).setColor(DISCORD_COLORS.WARNING);
    if (description) embed.setDescription(description);
    const message = new Message({ embeds: [embed] });
    await this._sendOne(message);
  }

  /**
   * Sends an error message with a red embed.
   * @param title The title of the embed.
   * @param description The description of the embed (optional).
   */
  public async error(title: string, description?: string) {
    const embed = new Embed().setTitle(title).setColor(DISCORD_COLORS.ERROR);
    if (description) embed.setDescription(description);
    const message = new Message({ embeds: [embed] });
    await this._sendOne(message);
  }

  /**
   * Deletes a previously sent webhook message.
   * @param messageLinkOrId The full message link (e.g., from Discord UI) or just the message ID of the message to delete.
   * @throws {Error} If the deletion fails.
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

    await this.requestClient.send(
      'DELETE',
      undefined,
      {
        'Content-Type': 'application/json',
      },
      url
    );
  }
}
