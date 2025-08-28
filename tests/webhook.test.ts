import { Webhook } from '../src/client/Webhook';
import { Message } from '../src/builders/Message';
import { Embed } from '../src/builders/Embed';
import { Field } from '../src/components/Field';
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

  // Create a mock for an AxiosInstance that will be returned by axios.create
  const mockAxiosInstance = {
    request: jest.fn().mockResolvedValue({
      data: {},
      status: 204,
      statusText: 'No Content',
      headers: {},
      config: {},
    }),
  };

  beforeAll(() => {
    // Create a dummy file for sendFile tests
    fs.writeFileSync(DUMMY_FILE_PATH, 'This is a dummy file for testing.');
  });

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Mock axios.create to return our mockAxiosInstance
    mockedAxios.create.mockReturnValue(mockAxiosInstance as AxiosInstance);

    webhook = new Webhook(WEBHOOK_URL);
  });

  afterAll(() => {
    // Clean up the dummy file after all tests are done
    fs.unlinkSync(DUMMY_FILE_PATH);
  });

  it('should send a basic message successfully', async () => {
    const message = new Message({ content: 'Hello from Jest!' });
    webhook.addMessage(message);
    await expect(webhook.send()).resolves.not.toThrow();
    expect(mockAxiosInstance.request).toHaveBeenCalledTimes(1);
    expect(mockAxiosInstance.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: undefined, // Expect undefined, as Request passes undefined
        data: expect.objectContaining({ content: 'Hello from Jest!' }),
        headers: { 'Content-Type': 'application/json' },
      })
    );
    // Additionally, verify that axios.create was called with the correct baseURL
    expect(mockedAxios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: WEBHOOK_URL,
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
    expect(mockAxiosInstance.request).toHaveBeenCalledTimes(1);
    expect(mockAxiosInstance.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: undefined,
        data: expect.objectContaining({
          content: 'Message with custom identity!',
          username: 'JestBot',
          avatar_url: 'https://i.imgur.com/AfFp7pu.png',
        }),
      })
    );
    expect(mockedAxios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: WEBHOOK_URL,
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
    expect(mockAxiosInstance.request).toHaveBeenCalledTimes(1);
    expect(mockAxiosInstance.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: undefined,
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
    expect(mockedAxios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: WEBHOOK_URL,
      })
    );
  });

  it('should send a message without content but with a valid embed', async () => {
    const embed = new Embed().setTitle('Valid Embed');
    const message = new Message({ embeds: [embed] });
    webhook.addMessage(message);
    await expect(webhook.send()).resolves.not.toThrow();
    expect(mockAxiosInstance.request).toHaveBeenCalledTimes(1);
    expect(mockAxiosInstance.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: undefined,
        data: expect.objectContaining({
          embeds: expect.arrayContaining([
            expect.objectContaining({ title: 'Valid Embed' }),
          ]),
        }),
      })
    );
    expect(mockedAxios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: WEBHOOK_URL,
      })
    );
  });

  it('should fail to send a message without content and with an invalid embed', async () => {
    const embed = new Embed(); // No content
    const message = new Message({ embeds: [embed] });
    webhook.addMessage(message);
    await expect(webhook.send()).rejects.toThrow(ValidationError);
    expect(mockAxiosInstance.request).not.toHaveBeenCalled();
  });

  it('should reject with a validation error for invalid embed URL', async () => {
    const embed = new Embed().setURL('not-a-valid-url');
    const message = new Message({ embeds: [embed] });
    webhook.addMessage(message);
    await expect(webhook.send()).rejects.toThrow(ValidationError);
    expect(mockAxiosInstance.request).not.toHaveBeenCalled(); // Should not make a request if validation fails
  });

  it('should send multiple messages in a batch successfully', async () => {
    const message1 = new Message({ content: 'Batch Message 1' });
    const message2 = new Message({ content: 'Batch Message 2' });
    webhook.addMessage(message1).addMessage(message2);
    await expect(webhook.send()).resolves.not.toThrow();
    expect(webhook.getPayloads().length).toBe(0); // Queue should be empty
    expect(mockAxiosInstance.request).toHaveBeenCalledTimes(2);
    expect(mockedAxios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: WEBHOOK_URL,
      })
    );
  });

  it('should edit an existing message successfully', async () => {
    const message = new Message({
      content: 'This message has been edited by Jest!',
      editTarget: '1234567890123456789',
    });
    webhook.addMessage(message);
    await expect(webhook.send()).resolves.not.toThrow();

    expect(mockAxiosInstance.request).toHaveBeenCalledTimes(1);
    expect(mockAxiosInstance.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'PATCH',
        url: '/messages/1234567890123456789',
        data: expect.objectContaining({
          content: 'This message has been edited by Jest!',
        }),
      })
    );
    expect(mockedAxios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: WEBHOOK_URL,
      })
    );
  });

  it('should send a file successfully', async () => {
    await webhook.sendFile(DUMMY_FILE_PATH);
    expect(mockAxiosInstance.request).toHaveBeenCalledTimes(1);
    expect(mockAxiosInstance.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: undefined,
        data: expect.any(FormData),
      })
    );
    expect(mockedAxios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: WEBHOOK_URL,
      })
    );
  });

  it('should send a file with a message successfully', async () => {
    const message = new Message({ content: 'File with message!' });
    await webhook.sendFile(DUMMY_FILE_PATH, message);
    expect(mockAxiosInstance.request).toHaveBeenCalledTimes(1);
    expect(mockAxiosInstance.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: undefined,
        data: expect.any(FormData),
      })
    );
    expect(mockedAxios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: WEBHOOK_URL,
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
    expect(mockAxiosInstance.request).toHaveBeenCalledTimes(1);
    expect(mockAxiosInstance.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: undefined,
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
    expect(mockedAxios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: WEBHOOK_URL,
      })
    );
  });

  it('should send a success message', async () => {
    await webhook.success('Success Title');
    expect(mockAxiosInstance.request).toHaveBeenCalledTimes(1);
    expect(mockAxiosInstance.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: undefined,
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
    expect(mockedAxios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: WEBHOOK_URL,
      })
    );
  });

  it('should send a warning message', async () => {
    await webhook.warning('Warning Title', 'Warning Description');
    expect(mockAxiosInstance.request).toHaveBeenCalledTimes(1);
    expect(mockAxiosInstance.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: undefined,
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
    expect(mockedAxios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: WEBHOOK_URL,
      })
    );
  });

  it('should send an error message', async () => {
    await webhook.error('Error Title');
    expect(mockAxiosInstance.request).toHaveBeenCalledTimes(1);
    expect(mockAxiosInstance.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: undefined,
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
    expect(mockedAxios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: WEBHOOK_URL,
      })
    );
  });

  it('should initialize with multiple webhook URLs', () => {
    const WEBHOOK_URL_2 =
      'https://discord.com/api/webhooks/987654321098765432/zyxwuvtsrqponmlkjihgfedcbaZYXWVUTSRQPONMLKJIHGFEDCBA9876543210';
    const multiWebhook = new Webhook([WEBHOOK_URL, WEBHOOK_URL_2]);
    expect(multiWebhook.getWebhookCount()).toBe(2);
    expect(multiWebhook.getWebhookUrls()).toEqual([WEBHOOK_URL, WEBHOOK_URL_2]);
    expect(mockedAxios.create).toHaveBeenCalledTimes(3);
    expect(mockedAxios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: WEBHOOK_URL,
      })
    );
    expect(mockedAxios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: WEBHOOK_URL_2,
      })
    );
  });

  it('should add webhook URLs dynamically', () => {
    const WEBHOOK_URL_2 =
      'https://discord.com/api/webhooks/987654321098765432/zyxwuvtsrqponmlkjihgfedcbaZYXWVUTSRQPONMLKJIHGFEDCBA9876543210';
    webhook.addWebhookUrl(WEBHOOK_URL_2);
    expect(webhook.getWebhookCount()).toBe(2);
    expect(webhook.getWebhookUrls()).toEqual([WEBHOOK_URL, WEBHOOK_URL_2]);
    expect(mockedAxios.create).toHaveBeenCalledTimes(2);
    expect(mockedAxios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: WEBHOOK_URL_2,
      })
    );
  });

  it('should send a message to multiple webhooks', async () => {
    const WEBHOOK_URL_2 =
      'https://discord.com/api/webhooks/987654321098765432/zyxwuvtsrqponmlkjihgfedcbaZYXWVUTSRQPONMLKJIHGFEDCBA9876543210';
    webhook.addWebhookUrl(WEBHOOK_URL_2);
    const message = new Message({ content: 'Message to multiple webhooks!' });
    webhook.addMessage(message);

    await expect(webhook.send()).resolves.not.toThrow();
    expect(mockAxiosInstance.request).toHaveBeenCalledTimes(2); // Called once for each webhook
    expect(webhook.getPayloads().length).toBe(0); // Queue should be empty after successful send

    // Verify calls for each webhook
    expect(mockAxiosInstance.request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: undefined,
        data: expect.objectContaining({
          content: 'Message to multiple webhooks!',
        }),
      })
    );
    expect(mockAxiosInstance.request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: undefined,
        data: expect.objectContaining({
          content: 'Message to multiple webhooks!',
        }),
      })
    );
    expect(mockedAxios.create).toHaveBeenCalledTimes(2);
    expect(mockedAxios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: WEBHOOK_URL,
      })
    );
    expect(mockedAxios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: WEBHOOK_URL_2,
      })
    );
  });

  it('should handle send failure for one of multiple webhooks', async () => {
    const WEBHOOK_URL_2 =
      'https://discord.com/api/webhooks/987654321098765432/zyxwuvtsrqponmlkjihgfedcbaZYXWVUTSRQPONMLKJIHGFEDCBA9876543210';
    webhook.addWebhookUrl(WEBHOOK_URL_2);
    const message = new Message({
      content: 'Message to multiple webhooks with one failure!',
    });
    webhook.addMessage(message);

    // Mock the second webhook's request to fail
    mockAxiosInstance.request
      .mockResolvedValueOnce({
        data: {},
        status: 204,
        statusText: 'No Content',
        headers: {},
        config: {},
      }) // First webhook succeeds
      .mockRejectedValueOnce(
        new Error('Simulated network error for second webhook')
      ); // Second webhook fails

    await expect(webhook.send()).rejects.toThrow(
      'Failed to send 1 messages to one or more webhooks.'
    );
    expect(mockAxiosInstance.request).toHaveBeenCalledTimes(2); // Still attempts to send to both
    expect(webhook.getPayloads().length).toBe(1); // Message should remain in queue
    expect(mockedAxios.create).toHaveBeenCalledTimes(2);
    expect(mockedAxios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: WEBHOOK_URL,
      })
    );
    expect(mockedAxios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: WEBHOOK_URL_2,
      })
    );
  });

  it('should send file to multiple webhooks', async () => {
    const WEBHOOK_URL_2 =
      'https://discord.com/api/webhooks/987654321098765432/zyxwuvtsrqponmlkjihgfedcbaZYXWVUTSRQPONMLKJIHGFEDCBA9876543210';
    webhook.addWebhookUrl(WEBHOOK_URL_2);

    await webhook.sendFile(DUMMY_FILE_PATH);
    expect(mockAxiosInstance.request).toHaveBeenCalledTimes(2); // Called once for each webhook
    expect(mockAxiosInstance.request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: undefined,
        data: expect.any(FormData),
      })
    );
    expect(mockedAxios.create).toHaveBeenCalledTimes(2);
    expect(mockedAxios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: WEBHOOK_URL,
      })
    );
    expect(mockedAxios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: WEBHOOK_URL_2,
      })
    );
  });

  it('should send info message to multiple webhooks', async () => {
    const WEBHOOK_URL_2 =
      'https://discord.com/api/webhooks/987654321098765432/zyxwuvtsrqponmlkjihgfedcbaZYXWVUTSRQPONMLKJIHGFEDCBA9876543210';
    webhook.addWebhookUrl(WEBHOOK_URL_2);

    await webhook.info('Multi-Webhook Info');
    expect(mockAxiosInstance.request).toHaveBeenCalledTimes(2); // Called once for each webhook
    expect(mockAxiosInstance.request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: undefined,
        data: expect.objectContaining({
          embeds: expect.arrayContaining([
            expect.objectContaining({
              title: 'Multi-Webhook Info',
            }),
          ]),
        }),
      })
    );
    expect(mockedAxios.create).toHaveBeenCalledTimes(2);
    expect(mockedAxios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: WEBHOOK_URL,
      })
    );
    expect(mockedAxios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: WEBHOOK_URL_2,
      })
    );
  });

  it('should send success message to multiple webhooks', async () => {
    const WEBHOOK_URL_2 =
      'https://discord.com/api/webhooks/987654321098765432/zyxwuvtsrqponmlkjihgfedcbaZYXWVUTSRQPONMLKJIHGFEDCBA9876543210';
    webhook.addWebhookUrl(WEBHOOK_URL_2);

    await webhook.success('Multi-Webhook Success');
    expect(mockAxiosInstance.request).toHaveBeenCalledTimes(2); // Called once for each webhook
    expect(mockAxiosInstance.request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: undefined,
        data: expect.objectContaining({
          embeds: expect.arrayContaining([
            expect.objectContaining({
              title: 'Multi-Webhook Success',
            }),
          ]),
        }),
      })
    );
    expect(mockedAxios.create).toHaveBeenCalledTimes(2);
    expect(mockedAxios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: WEBHOOK_URL,
      })
    );
    expect(mockedAxios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: WEBHOOK_URL_2,
      })
    );
  });

  it('should send warning message to multiple webhooks', async () => {
    const WEBHOOK_URL_2 =
      'https://discord.com/api/webhooks/987654321098765432/zyxwuvtsrqponmlkjihgfedcbaZYXWVUTSRQPONMLKJIHGFEDCBA9876543210';
    webhook.addWebhookUrl(WEBHOOK_URL_2);

    await webhook.warning('Multi-Webhook Warning');
    expect(mockAxiosInstance.request).toHaveBeenCalledTimes(2); // Called once for each webhook
    expect(mockAxiosInstance.request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: undefined,
        data: expect.objectContaining({
          embeds: expect.arrayContaining([
            expect.objectContaining({
              title: 'Multi-Webhook Warning',
            }),
          ]),
        }),
      })
    );
    expect(mockedAxios.create).toHaveBeenCalledTimes(2);
    expect(mockedAxios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: WEBHOOK_URL,
      })
    );
    expect(mockedAxios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: WEBHOOK_URL_2,
      })
    );
  });

  it('should send error message to multiple webhooks', async () => {
    const WEBHOOK_URL_2 =
      'https://discord.com/api/webhooks/987654321098765432/zyxwuvtsrqponmlkjihgfedcbaZYXWVUTSRQPONMLKJIHGFEDCBA9876543210';
    webhook.addWebhookUrl(WEBHOOK_URL_2);

    await webhook.error('Multi-Webhook Error');
    expect(mockAxiosInstance.request).toHaveBeenCalledTimes(2); // Called once for each webhook
    expect(mockAxiosInstance.request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: undefined,
        data: expect.objectContaining({
          embeds: expect.arrayContaining([
            expect.objectContaining({
              title: 'Multi-Webhook Error',
            }),
          ]),
        }),
      })
    );
    expect(mockedAxios.create).toHaveBeenCalledTimes(2);
    expect(mockedAxios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: WEBHOOK_URL,
      })
    );
    expect(mockedAxios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: WEBHOOK_URL_2,
      })
    );
  });

  it('should delete message from multiple webhooks', async () => {
    const WEBHOOK_URL_2 =
      'https://discord.com/api/webhooks/987654321098765432/zyxwuvtsrqponmlkjihgfedcbaZYXWVUTSRQPONMLKJIHGFEDCBA9876543210';
    webhook.addWebhookUrl(WEBHOOK_URL_2);

    await webhook.delete('1234567890123456789');
    expect(mockAxiosInstance.request).toHaveBeenCalledTimes(2); // Called once for each webhook
    expect(mockAxiosInstance.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'DELETE',
        url: '/messages/1234567890123456789',
      })
    );
    expect(mockedAxios.create).toHaveBeenCalledTimes(2);
    expect(mockedAxios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: WEBHOOK_URL,
      })
    );
    expect(mockedAxios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: WEBHOOK_URL_2,
      })
    );
  });
});
