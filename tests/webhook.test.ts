import { Webhook, Message, Embed, Field } from '../src';
import { ZodError } from 'zod';

// This is a mock URL. The tests will not actually send requests.
const WEBHOOK_URL =
  'https://discord.com/api/webhooks/123456789012345678/abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890-_';

describe('Discord Webhook Library', () => {
  let webhook: Webhook;

  beforeAll(() => {
    // Mock fetch to prevent actual network requests
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        status: 204,
        statusText: 'No Content',
        text: () => Promise.resolve(''),
      } as Response)
    );
  });

  beforeEach(() => {
    webhook = new Webhook(WEBHOOK_URL);
    (global.fetch as jest.Mock).mockClear();
  });

  it('should send a basic message successfully', async () => {
    const message = new Message({ content: 'Hello from Jest!' });
    webhook.addMessage(message);
    await expect(webhook.send()).resolves.not.toThrow();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('should send a message with custom username and avatar', async () => {
    const message = new Message({
      content: 'Message with custom identity!',
      username: 'JestBot',
      avatar_url: 'https://i.imgur.com/AfFp7pu.png',
    });
    webhook.addMessage(message);
    await expect(webhook.send()).resolves.not.toThrow();
  });

  it('should send a message with a full embed', async () => {
    const embed = new Embed()
      .setTitle('Test Embed from Jest')
      .setDescription('This is a detailed embed sent via Jest.')
      .setColor(0x00ff00) // Green
      .setTimestamp(new Date())
      .setAuthor({
        name: 'Embed Author Jest',
        url: 'https://example.com',
        icon_url: 'https://i.imgur.com/AfFp7pu.png',
      })
      .setFooter({
        text: 'Jest Footer',
        icon_url: 'https://i.imgur.com/AfFp7pu.png',
      })
      .setImage('https://i.imgur.com/AfFp7pu.png')
      .setThumbnail('https://i.imgur.com/AfFp7pu.png')
      .addField(new Field('Field 1', 'Value 1', true))
      .addField(new Field('Field 2', 'Value 2', false));

    const message = new Message({
      content: 'Message with embed',
      embeds: [embed],
    });
    webhook.addMessage(message);
    await expect(webhook.send()).resolves.not.toThrow();
  });

  it('should reject with a validation error for invalid embed URL', async () => {
    const embed = new Embed().setURL('not-a-valid-url');
    const message = new Message({ embeds: [embed] });
    webhook.addMessage(message);
    await expect(webhook.send()).rejects.toThrow(ZodError);
  });

  it('should send multiple messages in a batch successfully', async () => {
    const message1 = new Message({ content: 'Batch Message 1' });
    const message2 = new Message({ content: 'Batch Message 2' });
    webhook.addMessage(message1).addMessage(message2);
    await expect(webhook.send()).resolves.not.toThrow();
    expect(webhook.getPayloads().length).toBe(0); // Queue should be empty
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('should edit an existing message successfully', async () => {
    const message = new Message({
      content: 'This message has been edited by Jest!',
      editTarget: '1234567890123456789',
    });
    webhook.addMessage(message);
    await expect(webhook.send()).resolves.not.toThrow();

    const fetchOptions = (global.fetch as jest.Mock).mock.calls[0][1];
    expect(fetchOptions.method).toBe('PATCH');
  });

  it('should clear messages from the queue', () => {
    const message1 = new Message({ content: 'Clear Test 1' });
    webhook.addMessage(message1);
    expect(webhook.getPayloads().length).toBe(1);
    webhook.clearMessages();
    expect(webhook.getPayloads().length).toBe(0);
  });
});
