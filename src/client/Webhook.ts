import { Message } from '../builders/Message';

export class Webhook {
  private webhookId: string;
  private webhookToken: string;
  private messages: Message[] = [];

  constructor(url: string) {
    const parts = url.split('/');
    this.webhookId = parts[parts.length - 2];
    this.webhookToken = parts[parts.length - 1];
  }

  public addMessage(message: Message) {
    this.messages.push(message);
    return this;
  }

  public clearMessages() {
    this.messages = [];
    return this;
  }

  public getPayloads(): Record<string, unknown>[] {
    return this.messages.map((message) => message.getPayload());
  }
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
