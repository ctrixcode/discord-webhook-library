/* eslint-disable @typescript-eslint/no-explicit-any */
import { Webhook } from '../src/client/Webhook';
import { Message } from '../src/builders/Message';
import { Embed } from '../src/builders/Embed';
import { Field } from '../src/components/Field';
import { ValidationError } from '../src/errors';
import axios, { type AxiosInstance } from 'axios';
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
  let mockAxiosInstance: jest.Mocked<AxiosInstance>; // Declare it here
  const DUMMY_FILE_PATH = path.join(__dirname, 'dummy.txt');

  beforeAll(() => {
    // Create a dummy file for sendFile tests
    fs.writeFileSync(DUMMY_FILE_PATH, 'This is a dummy file for testing.');
  });

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Create a fresh mock for an AxiosInstance for each test
    mockAxiosInstance = {
      // Removed const
      request: jest.fn().mockResolvedValue({
        data: {},
        status: 204,
        statusText: 'No Content',
        headers: {},
        config: {},
      }),
    } as any;
    // Mock axios.create to return our mockAxiosInstance
    mockedAxios.create.mockReturnValue(mockAxiosInstance);

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
    (mockAxiosInstance.request as jest.Mock)
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

  it('should create a webhook instance without an initial URL', () => {
    const webhookWithoutUrl = new Webhook();
    expect(webhookWithoutUrl).toBeInstanceOf(Webhook);
    expect(webhookWithoutUrl.getWebhookCount()).toBe(0);
  });

  it('should add a webhook URL to an instance created without one', () => {
    const webhookWithoutUrl = new Webhook();
    webhookWithoutUrl.addWebhookUrl(WEBHOOK_URL);
    expect(webhookWithoutUrl.getWebhookCount()).toBe(1);
    expect(webhookWithoutUrl.getWebhookUrls()).toEqual([WEBHOOK_URL]);
  });

  describe('Network Error Handling', () => {
    it('should handle ECONNREFUSED network errors', async () => {
      const networkError = new Error('connect ECONNREFUSED 127.0.0.1:443');
      (networkError as any).code = 'ECONNREFUSED';
      mockAxiosInstance.request.mockRejectedValueOnce(networkError);

      const message = new Message({ content: 'Test message' });
      webhook.addMessage(message);

      await expect(webhook.send()).rejects.toThrow(
        'connect ECONNREFUSED 127.0.0.1:443'
      );
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(1);
    });

    it('should handle ETIMEDOUT network errors', async () => {
      const timeoutError = new Error('request timeout');
      (timeoutError as any).code = 'ETIMEDOUT';
      mockAxiosInstance.request.mockRejectedValueOnce(timeoutError);

      const message = new Message({ content: 'Test message' });
      webhook.addMessage(message);

      await expect(webhook.send()).rejects.toThrow('request timeout');
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(1);
    });

    it('should handle ENOTFOUND DNS errors', async () => {
      const dnsError = new Error('getaddrinfo ENOTFOUND discord.com');
      (dnsError as any).code = 'ENOTFOUND';
      mockAxiosInstance.request.mockRejectedValueOnce(dnsError);

      const message = new Message({ content: 'Test message' });
      webhook.addMessage(message);

      await expect(webhook.send()).rejects.toThrow(
        'getaddrinfo ENOTFOUND discord.com'
      );
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(1);
    });

    it('should handle ECONNRESET connection reset errors', async () => {
      const resetError = new Error('socket hang up');
      (resetError as any).code = 'ECONNRESET';
      mockAxiosInstance.request.mockRejectedValueOnce(resetError);

      const message = new Message({ content: 'Test message' });
      webhook.addMessage(message);

      await expect(webhook.send()).rejects.toThrow('socket hang up');
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(1);
    });

    it('should handle network errors when sending files', async () => {
      const networkError = new Error('network timeout');
      (networkError as any).code = 'ETIMEDOUT';
      mockAxiosInstance.request.mockRejectedValueOnce(networkError);

      await expect(
        webhook.sendFile(
          DUMMY_FILE_PATH,
          new Message({
            content: 'File attachment',
          })
        )
      ).rejects.toThrow('network timeout');
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(1);
    });

    it('should handle certificate validation errors', async () => {
      const certError = new Error('self signed certificate');
      (certError as any).code = 'DEPTH_ZERO_SELF_SIGNED_CERT';
      mockAxiosInstance.request.mockRejectedValueOnce(certError);

      const message = new Message({ content: 'Test message' });
      webhook.addMessage(message);

      await expect(webhook.send()).rejects.toThrow('self signed certificate');
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(1);
    });
  });

  describe('Complex Integration Scenarios', () => {
    it('should handle sequential sends with different messages', async () => {
      const message1 = new Message({ content: 'First message' });
      const message2 = new Message({ content: 'Second message' });

      webhook.addMessage(message1);
      await webhook.send();

      webhook.addMessage(message2);
      await webhook.send();

      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(2);
    });

    it('should handle mixed content and embed messages in sequence', async () => {
      const contentMessage = new Message({ content: 'Content only' });
      const embedMessage = new Message().addEmbed(
        new Embed().setTitle('Embed only')
      );

      webhook.addMessage(contentMessage);
      await webhook.send();

      webhook.addMessage(embedMessage);
      await webhook.send();

      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(2);
      expect(mockAxiosInstance.request).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          data: expect.objectContaining({ content: 'Content only' }),
        })
      );
      expect(mockAxiosInstance.request).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          data: expect.objectContaining({
            embeds: expect.arrayContaining([
              expect.objectContaining({ title: 'Embed only' }),
            ]),
          }),
        })
      );
    });

    it('should handle file upload after regular message', async () => {
      const message = new Message({ content: 'Regular message' });
      webhook.addMessage(message);
      await webhook.send();

      await webhook.sendFile(
        DUMMY_FILE_PATH,
        new Message({
          content: 'File message',
        })
      );

      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(2);
      expect(mockAxiosInstance.request).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          data: expect.objectContaining({ content: 'Regular message' }),
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(mockAxiosInstance.request).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          method: 'POST',
          data: expect.any(Object),
        })
      );
      // Verify that the second call has FormData
      const secondCallData = mockAxiosInstance.request.mock.calls[1][0].data;
      expect(secondCallData).toBeDefined();
      expect(typeof secondCallData).toBe('object');
    });

    it('should handle rapid successive sends', async () => {
      const messages = [
        new Message({ content: 'Message 1' }),
        new Message({ content: 'Message 2' }),
        new Message({ content: 'Message 3' }),
      ];

      // Send each message independently
      for (const msg of messages) {
        webhook.addMessage(msg);
        await webhook.send();
      }

      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(3);
    });

    it('should handle sends with all helper methods in sequence', async () => {
      await webhook.info('Info message');
      await webhook.success('Success message');
      await webhook.warning('Warning message');
      await webhook.error('Error message');

      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(4);
    });

    it('should handle complex message with maximum allowed content', async () => {
      const maxContent = 'a'.repeat(2000);
      const message = new Message({
        content: maxContent,
        username: 'TestBot',
        avatar_url: 'https://example.com/avatar.png',
      });

      const embeds = Array(10)
        .fill(null)
        .map((_, i) =>
          new Embed()
            .setTitle(`Embed ${i + 1}`)
            .setDescription(`Description ${i + 1}`)
        );

      embeds.forEach((embed) => message.addEmbed(embed));
      webhook.addMessage(message);
      await webhook.send();

      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(1);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            content: maxContent,
            username: 'TestBot',
            avatar_url: 'https://example.com/avatar.png',
            embeds: expect.arrayContaining([
              expect.objectContaining({ title: 'Embed 1' }),
              expect.objectContaining({ title: 'Embed 10' }),
            ]),
          }),
        })
      );
    });
  });
});
