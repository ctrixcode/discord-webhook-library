import { Webhook, Message, Embed, Field } from '../src';
import { ValidationError } from '../src/errors';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import FormData from 'form-data';
import { DISCORD_COLORS } from '../src/constants/colors';

// Mock the entire axios module
jest.mock('axios');

// Cast axios to a Jest mock to access its mock methods
const mockedAxios = axios as jest.Mocked<typeof axios>;

// This is a mock URL. The tests will not actually send requests.
const WEBHOOK_URL =
  'https://discord.com/api/webhooks/123456789012345678/abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890-_';

describe('Discord Webhook Library', () => {
  let webhook: Webhook;
  const DUMMY_FILE_PATH = path.join(__dirname, 'dummy.txt');

  beforeAll(() => {
    // Create a dummy file for sendFile tests
    fs.writeFileSync(DUMMY_FILE_PATH, 'This is a dummy file for testing.');

    // Mock axios.create().request to simulate successful responses
    mockedAxios.create.mockReturnThis(); // Mock create() to return the mocked axios itself
    mockedAxios.request.mockResolvedValue({
      data: {},
      status: 204,
      statusText: 'No Content',
      headers: {},
      config: {},
    });
  });

  beforeEach(() => {
    webhook = new Webhook(WEBHOOK_URL);
    mockedAxios.request.mockClear(); // Clear mock calls before each test
  });

  afterAll(() => {
    // Clean up the dummy file after all tests are done
    fs.unlinkSync(DUMMY_FILE_PATH);
  });

  it('should send a basic message successfully', async () => {
    const message = new Message({ content: 'Hello from Jest!' });
    webhook.addMessage(message);
    await expect(webhook.send()).resolves.not.toThrow();
    expect(mockedAxios.request).toHaveBeenCalledTimes(1);
    expect(mockedAxios.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        data: expect.objectContaining({ content: 'Hello from Jest!' }),
        headers: { 'Content-Type': 'application/json' },
      })
    );
  });

  it('should send a message with custom username and avatar', async () => {
    const message = new Message({
      content: 'Message with custom identity!',
      username: 'JestBot',
      avatar_url: 'https://i.imgur.com/AfFp7pu.png',
    });
    webhook.addMessage(message);
    await expect(webhook.send()).resolves.not.toThrow();
    expect(mockedAxios.request).toHaveBeenCalledTimes(1);
    expect(mockedAxios.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        data: expect.objectContaining({
          content: 'Message with custom identity!',
          username: 'JestBot',
          avatar_url: 'https://i.imgur.com/AfFp7pu.png',
        }),
      })
    );
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
    expect(mockedAxios.request).toHaveBeenCalledTimes(1);
    expect(mockedAxios.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        data: expect.objectContaining({
          content: 'Message with embed',
          embeds: expect.arrayContaining([
            expect.objectContaining({
              title: 'Test Embed from Jest',
            }),
          ]),
        }),
      })
    );
  });

  it('should send a message without content but with a valid embed', async () => {
    const embed = new Embed().setTitle('Valid Embed');
    const message = new Message({ embeds: [embed] });
    webhook.addMessage(message);
    await expect(webhook.send()).resolves.not.toThrow();
    expect(mockedAxios.request).toHaveBeenCalledTimes(1);
    expect(mockedAxios.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        data: expect.objectContaining({
          embeds: expect.arrayContaining([
            expect.objectContaining({ title: 'Valid Embed' }),
          ]),
        }),
      })
    );
  });

  it('should fail to send a message without content and with an invalid embed', async () => {
    const embed = new Embed(); // No content
    const message = new Message({ embeds: [embed] });
    webhook.addMessage(message);
    await expect(webhook.send()).rejects.toThrow(ValidationError);
    expect(mockedAxios.request).not.toHaveBeenCalled();
  });

  it('should reject with a validation error for invalid embed URL', async () => {
    const embed = new Embed().setURL('not-a-valid-url');
    const message = new Message({ embeds: [embed] });
    webhook.addMessage(message);
    await expect(webhook.send()).rejects.toThrow(ValidationError);
    expect(mockedAxios.request).not.toHaveBeenCalled(); // Should not make a request if validation fails
  });

  it('should send multiple messages in a batch successfully', async () => {
    const message1 = new Message({ content: 'Batch Message 1' });
    const message2 = new Message({ content: 'Batch Message 2' });
    webhook.addMessage(message1).addMessage(message2);
    await expect(webhook.send()).resolves.not.toThrow();
    expect(webhook.getPayloads().length).toBe(0); // Queue should be empty
    expect(mockedAxios.request).toHaveBeenCalledTimes(2);
  });

  it('should edit an existing message successfully', async () => {
    const message = new Message({
      content: 'This message has been edited by Jest!',
      editTarget: '1234567890123456789',
    });
    webhook.addMessage(message);
    await expect(webhook.send()).resolves.not.toThrow();

    expect(mockedAxios.request).toHaveBeenCalledTimes(1);
    expect(mockedAxios.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'PATCH',
        url: '/messages/1234567890123456789',
        data: expect.objectContaining({
          content: 'This message has been edited by Jest!',
        }),
      })
    );
  });

  it('should send a file successfully', async () => {
    await webhook.sendFile(DUMMY_FILE_PATH);
    expect(mockedAxios.request).toHaveBeenCalledTimes(1);
    expect(mockedAxios.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        data: expect.any(FormData),
      })
    );
  });

  it('should send a file with a message successfully', async () => {
    const message = new Message({ content: 'File with message!' });
    await webhook.sendFile(DUMMY_FILE_PATH, message);
    expect(mockedAxios.request).toHaveBeenCalledTimes(1);
    expect(mockedAxios.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        data: expect.any(FormData),
      })
    );
    // Further inspection of FormData content is complex with Jest mocks
  });

  it('should clear messages from the queue', () => {
    const message1 = new Message({ content: 'Clear Test 1' });
    webhook.addMessage(message1);
    expect(webhook.getPayloads().length).toBe(1);
    webhook.clearMessages();
    expect(webhook.getPayloads().length).toBe(0);
  });

  // Helper method tests
  it('should send an info message', async () => {
    await webhook.info('Info Title', 'Info Description');
    expect(mockedAxios.request).toHaveBeenCalledTimes(1);
    expect(mockedAxios.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        data: expect.objectContaining({
          embeds: expect.arrayContaining([
            expect.objectContaining({
              title: 'Info Title',
              description: 'Info Description',
              color: DISCORD_COLORS.INFO,
            }),
          ]),
        }),
      })
    );
  });

  it('should send a success message', async () => {
    await webhook.success('Success Title');
    expect(mockedAxios.request).toHaveBeenCalledTimes(1);
    expect(mockedAxios.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        data: expect.objectContaining({
          embeds: expect.arrayContaining([
            expect.objectContaining({
              title: 'Success Title',
              color: DISCORD_COLORS.SUCCESS,
            }),
          ]),
        }),
      })
    );
  });

  it('should send a warning message', async () => {
    await webhook.warning('Warning Title', 'Warning Description');
    expect(mockedAxios.request).toHaveBeenCalledTimes(1);
    expect(mockedAxios.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        data: expect.objectContaining({
          embeds: expect.arrayContaining([
            expect.objectContaining({
              title: 'Warning Title',
              description: 'Warning Description',
              color: DISCORD_COLORS.WARNING,
            }),
          ]),
        }),
      })
    );
  });

  it('should send an error message', async () => {
    await webhook.error('Error Title');
    expect(mockedAxios.request).toHaveBeenCalledTimes(1);
    expect(mockedAxios.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        data: expect.objectContaining({
          embeds: expect.arrayContaining([
            expect.objectContaining({
              title: 'Error Title',
              color: DISCORD_COLORS.ERROR,
            }),
          ]),
        }),
      })
    );
  });
});
