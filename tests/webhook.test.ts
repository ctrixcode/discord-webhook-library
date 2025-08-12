import { Webhook, Message, Embed, Field } from '../src';

const WEBHOOK_URL =
  'https://discord.com/api/webhooks/1404796031803195565/oihzs-1J74x0_Pt3u1YtmLe-XrJp0Xsa6lHaHzHcxbYTzjLpZCV-JRmm-RDZB7pqaKe8';

describe('Discord Webhook Library Integration Tests', () => {
  let webhook: Webhook;

  beforeEach(() => {
    webhook = new Webhook(WEBHOOK_URL);
  });

  afterEach(async () => {
    // Clear any remaining messages in the queue after each test
    webhook.clearMessages();
    // Add a small delay to prevent rate limits during rapid testing
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  it('should send a basic message successfully', async () => {
    const message = new Message({ content: 'Hello from Jest!' });
    webhook.addMessage(message);
    await expect(webhook.send()).resolves.not.toThrow();
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

  it('should send an embed with partial author data', async () => {
    // Test with only name
    const embed1 = new Embed()
      .setTitle('Partial Author 1')
      .setAuthor({ name: 'Only Name' });
    const message1 = new Message({ embeds: [embed1] });
    webhook.addMessage(message1);
    await expect(webhook.send()).resolves.not.toThrow();

    // Test with name and icon_url (no url)
    const embed2 = new Embed().setTitle('Partial Author 2').setAuthor({
      name: 'Name and Icon',
      icon_url: 'https://i.imgur.com/AfFp7pu.png',
    });
    const message2 = new Message({ embeds: [embed2] });
    webhook.addMessage(message2);
    await expect(webhook.send()).resolves.not.toThrow();

    // Test with name and url (no icon_url)
    const embed3 = new Embed()
      .setTitle('Partial Author 3')
      .setAuthor({ name: 'Name and URL', url: 'https://example.com/url' });
    const message3 = new Message({ embeds: [embed3] });
    webhook.addMessage(message3);
    await expect(webhook.send()).resolves.not.toThrow();
  });

  it('should send a message with thread name and flags', async () => {
    // Note: thread_name only works in forum channels. flags might be restricted.
    const message = new Message({
      content:
        'Message for a new thread (thread_name and flags commented out for general testing)',
      // thread_name: 'jest-test-thread',
      // flags: 4096, // SUPPRESS_EMBEDS
    });
    webhook.addMessage(message);
    await expect(webhook.send()).resolves.not.toThrow();
  });

  it('should send multiple messages in a batch successfully', async () => {
    const message1 = new Message({ content: 'Batch Message 1' });
    const message2 = new Message({ content: 'Batch Message 2' });
    const message3 = new Message({ content: 'Batch Message 3' });

    webhook.addMessage(message1);
    webhook.addMessage(message2);
    webhook.addMessage(message3);

    await expect(webhook.send()).resolves.not.toThrow();
    expect(webhook.getPayloads().length).toBe(0); // Queue should be empty after successful send
  });

  it('should edit an existing message successfully', async () => {
    const MESSAGE_LINK_TO_EDIT =
      'https://discord.com/channels/1197161057085566986/1404795994536935484/1404805868956028969';
    const message = new Message({
      content: 'This message has been edited by Jest!',
      editTarget: MESSAGE_LINK_TO_EDIT,
    });
    webhook.addMessage(message);
    await expect(webhook.send()).resolves.not.toThrow();
  });

  it('should clear messages from the queue', () => {
    const message1 = new Message({ content: 'Clear Test 1' });
    const message2 = new Message({ content: 'Clear Test 2' });
    webhook.addMessage(message1);
    webhook.addMessage(message2);

    expect(webhook.getPayloads().length).toBe(2);
    webhook.clearMessages();
    expect(webhook.getPayloads().length).toBe(0);
  });
});
