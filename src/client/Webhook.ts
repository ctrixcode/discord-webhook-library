import { Message } from '../builders/Message';

export class Webhook {
  private webhookId: string;
  private webhookToken: string;

  constructor(url: string) {
    const parts = url.split('/');
    this.webhookId = parts[parts.length - 2];
    this.webhookToken = parts[parts.length - 1];
  }

  public async send(message: Message) {
    const payload: Record<string, unknown> = {};

    if (message.content) payload.content = message.content;
    if (message.username) payload.username = message.username;
    if (message.avatar_url) payload.avatar_url = message.avatar_url;
    if (message.tts) payload.tts = message.tts;
    if (message.thread_name) payload.thread_name = message.thread_name;
    if (message.flags !== undefined) payload.flags = message.flags;

    if (message.embeds.length > 0) {
      payload.embeds = message.embeds.map((embed) => {
        const embedPayload: Record<string, unknown> = {};
        if (embed.title) embedPayload.title = embed.title;
        if (embed.description) embedPayload.description = embed.description;
        if (embed.url) embedPayload.url = embed.url;
        if (embed.color) embedPayload.color = embed.color;
        if (embed.timestamp) embedPayload.timestamp = embed.timestamp;
        if (embed.author) {
          embedPayload.author = {
            name: embed.author.name,
            ...(embed.author.url && { url: embed.author.url }),
            ...(embed.author.icon_url && { icon_url: embed.author.icon_url }),
          };
        }
        if (embed.footer) {
          embedPayload.footer = {
            text: embed.footer.text,
            ...(embed.footer.icon_url && { icon_url: embed.footer.icon_url }),
          };
        }
        if (embed.image) embedPayload.image = { url: embed.image.url };
        if (embed.thumbnail)
          embedPayload.thumbnail = { url: embed.thumbnail.url };

        // Always include fields array, even if empty
        embedPayload.fields = embed.fields.map((field) => ({
          name: field.name,
          value: field.value,
          ...(field.inline !== undefined && { inline: field.inline }),
        }));

        return embedPayload;
      });
    }

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
