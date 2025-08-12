import { Message } from '../builders/Message';

export class Webhook {
  private webhookId: string;
  private webhookToken: string;
  private messages: Message[] = [];

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
      throw new Error(
        `Failed to send ${errors.length} messages. See .errors for details.`
      );
    }
  }

  private async _sendOne(message: Message) {
    const payload = message.getPayload();

    let requestUrl = `https://discord.com/api/webhooks/${this.webhookId}/${this.webhookToken}`;
    let method = 'POST';

    if (message.editTarget) {
      const messageIdMatch = message.editTarget.match(/\/([0-9]+)$/);
      if (!messageIdMatch) {
        throw new Error('Invalid message link provided for editTarget.');
      }
      const messageId = messageIdMatch[1];
      requestUrl = `${requestUrl}/messages/${messageId}`;
      method = 'PATCH';
    }

    const response = await fetch(requestUrl, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to send/edit webhook: ${response.status} ${response.statusText} - ${errorText}`
      );
    }
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

    const requestUrl = `https://discord.com/api/webhooks/${this.webhookId}/${this.webhookToken}/messages/${messageId}`;
    const response = await fetch(requestUrl, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to delete webhook message: ${response.status} ${response.statusText} - ${errorText}`
      );
    }
  }
}
