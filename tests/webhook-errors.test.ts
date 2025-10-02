/* eslint-disable @typescript-eslint/no-explicit-any */
import { Webhook } from '../src/client/Webhook';
import { Message } from '../src/builders/Message';
import { Embed } from '../src/builders/Embed';
import { RequestError, WebhookError } from '../src/errors';
import axios, { type AxiosInstance, AxiosError } from 'axios';

// Mock the entire axios module
jest.mock('axios');

// Cast axios to a Jest mock to access its mock methods
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Test webhook URL
const WEBHOOK_URL =
  'https://discord.com/api/webhooks/123456789012345678/abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890-_';

describe('Webhook Error Handling - HTTP Status Codes', () => {
  let webhook: Webhook;
  let mockAxiosInstance: jest.Mocked<AxiosInstance>;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Create a fresh mock for an AxiosInstance for each test
    mockAxiosInstance = {
      request: jest.fn(),
    } as any;

    // Mock axios.create to return our mockAxiosInstance
    mockedAxios.create.mockReturnValue(mockAxiosInstance);

    webhook = new Webhook(WEBHOOK_URL);
  });

  describe('400 Bad Request Errors', () => {
    it('should handle 400 error with generic bad request message', async () => {
      const message = new Message({ content: 'Test message' });
      webhook.addMessage(message);

      // Mock a 400 error response
      const axiosError = new AxiosError('Bad Request');
      axiosError.response = {
        status: 400,
        data: {
          message: 'Invalid payload',
        },
        statusText: 'Bad Request',
        headers: {},
        config: {} as any,
      };

      mockAxiosInstance.request.mockRejectedValueOnce(axiosError);

      try {
        await webhook.send();
        fail('Expected to throw');
        fail('Expected webhook.send() to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(WebhookError);
        expect((error as WebhookError).code).toBe('BATCH_SEND_FAILURE');
        expect((error as WebhookError).message).toContain('Invalid payload');
        // Check that the underlying error is a RequestError
        const details = (error as WebhookError).details as any[];
        expect(details[0].error).toBeInstanceOf(RequestError);
        expect((details[0].error as RequestError).status).toBe(400);
        expect((details[0].error as RequestError).discordMessage).toBe(
          'Invalid payload'
        );
      }
    });

    it('should handle 400 error with code 50035 (invalid form body)', async () => {
      const message = new Message({ content: 'Test message' });
      webhook.addMessage(message);

      // Mock a 400 error with code 50035 (invalid form body)
      const axiosError = new AxiosError('Bad Request');
      axiosError.response = {
        status: 400,
        data: {
          code: 50035,
          message: 'Invalid Form Body',
          errors: {
            content: {
              _errors: [
                {
                  code: 'BASE_TYPE_BAD_LENGTH',
                  message: 'Must be between 1 and 2000 characters',
                },
              ],
            },
          },
        },
        statusText: 'Bad Request',
        headers: {},
        config: {} as any,
      };

      mockAxiosInstance.request.mockRejectedValueOnce(axiosError);

      try {
        await webhook.send();
        fail('Expected to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(WebhookError);
        expect((error as WebhookError).code).toBe('BATCH_SEND_FAILURE');
        const details = (error as WebhookError).details as any[];
        expect(details[0].error).toBeInstanceOf(RequestError);
        expect((details[0].error as RequestError).status).toBe(400);
        expect((details[0].error as RequestError).code).toBe(50035);
      }
    });

    it('should handle 400 error without specific Discord message', async () => {
      const message = new Message({ content: 'Test message' });
      webhook.addMessage(message);

      // Mock a 400 error without Discord-specific message
      const axiosError = new AxiosError('Bad Request');
      axiosError.response = {
        status: 400,
        data: {},
        statusText: 'Bad Request',
        headers: {},
        config: {} as any,
      };

      mockAxiosInstance.request.mockRejectedValueOnce(axiosError);

      try {
        await webhook.send();
        fail('Expected to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(WebhookError);
        const details = (error as WebhookError).details as any[];
        expect(details[0].error).toBeInstanceOf(RequestError);
        expect((details[0].error as RequestError).status).toBe(400);
        expect((details[0].error as RequestError).code).toBe('BAD_REQUEST');
      }
    });
  });

  describe('429 Rate Limit Errors', () => {
    it('should retry on 429 rate limit with retry_after and succeed', async () => {
      const message = new Message({ content: 'Test message' });
      webhook.addMessage(message);

      // Mock first request to fail with 429, second to succeed
      const axiosError = new AxiosError('Too Many Requests');
      axiosError.response = {
        status: 429,
        data: {
          retry_after: 0.1, // 100ms delay
          message: 'You are being rate limited.',
        },
        statusText: 'Too Many Requests',
        headers: {
          'x-ratelimit-reset-after': '0.1',
        },
        config: {} as any,
      };

      mockAxiosInstance.request
        .mockRejectedValueOnce(axiosError)
        .mockResolvedValueOnce({
          data: {},
          status: 204,
          statusText: 'No Content',
          headers: {},
          config: {} as any,
        });

      await expect(webhook.send()).resolves.not.toThrow();
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(2);
    });

    it('should retry on 429 rate limit using header x-ratelimit-reset-after', async () => {
      const message = new Message({ content: 'Test message' });
      webhook.addMessage(message);

      // Mock first request to fail with 429 without retry_after in body
      const axiosError = new AxiosError('Too Many Requests');
      axiosError.response = {
        status: 429,
        data: {
          message: 'You are being rate limited.',
        },
        statusText: 'Too Many Requests',
        headers: {
          'x-ratelimit-reset-after': '0.1',
        },
        config: {} as any,
      };

      mockAxiosInstance.request
        .mockRejectedValueOnce(axiosError)
        .mockResolvedValueOnce({
          data: {},
          status: 204,
          statusText: 'No Content',
          headers: {},
          config: {} as any,
        });

      await expect(webhook.send()).resolves.not.toThrow();
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(2);
    });

    it('should fail after exceeding retry limit on 429', async () => {
      const message = new Message({ content: 'Test message' });
      webhook.addMessage(message);

      // Mock all requests to fail with 429
      const axiosError = new AxiosError('Too Many Requests');
      axiosError.response = {
        status: 429,
        data: {
          retry_after: 0.01, // Very short delay
          message: 'You are being rate limited.',
        },
        statusText: 'Too Many Requests',
        headers: {
          'x-ratelimit-reset-after': '0.01',
        },
        config: {} as any,
      };

      // Mock to always fail with 429
      mockAxiosInstance.request.mockRejectedValue(axiosError);

      try {
        await webhook.send();
        fail('Expected to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(WebhookError);
        const details = (error as WebhookError).details as any[];
        expect(details[0].error).toBeInstanceOf(RequestError);
        expect((details[0].error as RequestError).status).toBe(429);
        expect((details[0].error as RequestError).code).toBe(
          'RATE_LIMIT_EXCEEDED'
        );
      }
    }, 15000); // Increase timeout for this test as it involves multiple retries

    it('should handle 429 rate limit with default 3 second retry_after', async () => {
      const message = new Message({ content: 'Test message' });
      webhook.addMessage(message);

      // Mock 429 without retry_after or header
      const axiosError = new AxiosError('Too Many Requests');
      axiosError.response = {
        status: 429,
        data: {
          message: 'You are being rate limited.',
        },
        statusText: 'Too Many Requests',
        headers: {},
        config: {} as any,
      };

      mockAxiosInstance.request
        .mockRejectedValueOnce(axiosError)
        .mockResolvedValueOnce({
          data: {},
          status: 204,
          statusText: 'No Content',
          headers: {},
          config: {} as any,
        });

      await expect(webhook.send()).resolves.not.toThrow();
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(2);
    }, 10000); // Increase timeout for this test
  });

  describe('500 Internal Server Error', () => {
    it('should handle 500 internal server error', async () => {
      const message = new Message({ content: 'Test message' });
      webhook.addMessage(message);

      // Mock a 500 error response
      const axiosError = new AxiosError('Internal Server Error');
      axiosError.response = {
        status: 500,
        data: {
          message: 'Internal Server Error',
        },
        statusText: 'Internal Server Error',
        headers: {},
        config: {} as any,
      };

      mockAxiosInstance.request.mockRejectedValueOnce(axiosError);

      try {
        await webhook.send();
        fail('Expected to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(WebhookError);
        const details = (error as WebhookError).details as any[];
        expect(details[0].error).toBeInstanceOf(RequestError);
        expect((details[0].error as RequestError).status).toBe(500);
        expect((details[0].error as RequestError).discordMessage).toBe(
          'Internal Server Error'
        );
      }
    });

    it('should handle 500 error without Discord message', async () => {
      const message = new Message({ content: 'Test message' });
      webhook.addMessage(message);

      // Mock a 500 error without specific Discord message
      const axiosError = new AxiosError('Something went wrong');
      axiosError.response = {
        status: 500,
        data: {},
        statusText: 'Internal Server Error',
        headers: {},
        config: {} as any,
      };

      mockAxiosInstance.request.mockRejectedValueOnce(axiosError);

      try {
        await webhook.send();
        fail('Expected to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(WebhookError);
        const details = (error as WebhookError).details as any[];
        const requestError = details[0].error as RequestError;
        expect(requestError.status).toBe(500);
      }
    });

    it('should handle 503 Service Unavailable error', async () => {
      const message = new Message({ content: 'Test message' });
      webhook.addMessage(message);

      // Mock a 503 error response
      const axiosError = new AxiosError('Service Unavailable');
      axiosError.response = {
        status: 503,
        data: {
          message: 'Service temporarily unavailable',
        },
        statusText: 'Service Unavailable',
        headers: {},
        config: {} as any,
      };

      mockAxiosInstance.request.mockRejectedValueOnce(axiosError);

      try {
        await webhook.send();
        fail('Expected to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(WebhookError);
        const details = (error as WebhookError).details as any[];
        const requestError = details[0].error as RequestError;
        expect(requestError.status).toBe(503);
      }
    });
  });

  describe('Other HTTP Error Codes', () => {
    it('should handle 401 Unauthorized error', async () => {
      const message = new Message({ content: 'Test message' });
      webhook.addMessage(message);

      const axiosError = new AxiosError('Unauthorized');
      axiosError.response = {
        status: 401,
        data: {
          message: 'Unauthorized',
        },
        statusText: 'Unauthorized',
        headers: {},
        config: {} as any,
      };

      mockAxiosInstance.request.mockRejectedValueOnce(axiosError);

      try {
        await webhook.send();
        fail('Expected to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(WebhookError);
        const details = (error as WebhookError).details as any[];
        expect(details[0].error).toBeInstanceOf(RequestError);
        expect((details[0].error as RequestError).status).toBe(401);
        expect((details[0].error as RequestError).code).toBe('UNAUTHORIZED');
      }
    });

    it('should handle 403 Forbidden error', async () => {
      const message = new Message({ content: 'Test message' });
      webhook.addMessage(message);

      const axiosError = new AxiosError('Forbidden');
      axiosError.response = {
        status: 403,
        data: {
          message: 'Forbidden',
        },
        statusText: 'Forbidden',
        headers: {},
        config: {} as any,
      };

      mockAxiosInstance.request.mockRejectedValueOnce(axiosError);

      try {
        await webhook.send();
        fail('Expected to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(WebhookError);
        const details = (error as WebhookError).details as any[];
        expect(details[0].error).toBeInstanceOf(RequestError);
        expect((details[0].error as RequestError).status).toBe(403);
        expect((details[0].error as RequestError).code).toBe('FORBIDDEN');
      }
    });

    it('should handle 404 Not Found error', async () => {
      const message = new Message({ content: 'Test message' });
      webhook.addMessage(message);

      const axiosError = new AxiosError('Not Found');
      axiosError.response = {
        status: 404,
        data: {
          message: 'Unknown Webhook',
        },
        statusText: 'Not Found',
        headers: {},
        config: {} as any,
      };

      mockAxiosInstance.request.mockRejectedValueOnce(axiosError);

      try {
        await webhook.send();
        fail('Expected to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(WebhookError);
        const details = (error as WebhookError).details as any[];
        expect(details[0].error).toBeInstanceOf(RequestError);
        expect((details[0].error as RequestError).status).toBe(404);
        expect((details[0].error as RequestError).code).toBe(
          'WEBHOOK_NOT_FOUND'
        );
      }
    });

    it('should handle 413 Payload Too Large error', async () => {
      const message = new Message({ content: 'Test message' });
      webhook.addMessage(message);

      const axiosError = new AxiosError('Payload Too Large');
      axiosError.response = {
        status: 413,
        data: {
          message: 'Request entity too large',
        },
        statusText: 'Payload Too Large',
        headers: {},
        config: {} as any,
      };

      mockAxiosInstance.request.mockRejectedValueOnce(axiosError);

      try {
        await webhook.send();
        fail('Expected to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(WebhookError);
        const details = (error as WebhookError).details as any[];
        expect(details[0].error).toBeInstanceOf(RequestError);
        expect((details[0].error as RequestError).status).toBe(413);
        expect((details[0].error as RequestError).code).toBe(
          'PAYLOAD_TOO_LARGE'
        );
      }
    });
  });

  describe('Network and Non-Axios Errors', () => {
    it('should handle network error without response', async () => {
      const message = new Message({ content: 'Test message' });
      webhook.addMessage(message);

      // Mock a network error (no response object)
      const axiosError = new AxiosError('Network Error');
      axiosError.code = 'ENOTFOUND';

      mockAxiosInstance.request.mockRejectedValueOnce(axiosError);
    });

    it('should handle timeout error', async () => {
      const message = new Message({ content: 'Test message' });
      webhook.addMessage(message);

      // Mock a timeout error
      const axiosError = new AxiosError('Timeout');
      axiosError.code = 'ECONNABORTED';

      mockAxiosInstance.request.mockRejectedValueOnce(axiosError);
    });

    it('should handle non-Axios errors', async () => {
      const message = new Message({ content: 'Test message' });
      webhook.addMessage(message);

      // Mock a non-Axios error
      const genericError = new Error('Something went wrong');

      mockAxiosInstance.request.mockRejectedValueOnce(genericError);
    });
  });

  describe('Helper Method Error Handling', () => {
    it('should propagate errors from info() helper', async () => {
      const axiosError = new AxiosError('Bad Request');
      axiosError.response = {
        status: 400,
        data: {
          message: 'Invalid payload',
        },
        statusText: 'Bad Request',
        headers: {},
        config: {} as any,
      };

      mockAxiosInstance.request.mockRejectedValueOnce(axiosError);

      try {
        await webhook.info('Test', 'Description');
        fail('Expected to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(WebhookError);
        const details = (error as WebhookError).details as any[];
        const requestError = details[0].error as RequestError;
        expect(requestError.status).toBe(400);
      }
    });

    it('should propagate errors from success() helper', async () => {
      const axiosError = new AxiosError('Rate Limited');
      axiosError.response = {
        status: 429,
        data: {
          retry_after: 0.1,
          message: 'Rate limited',
        },
        statusText: 'Too Many Requests',
        headers: {},
        config: {} as any,
      };

      mockAxiosInstance.request.mockRejectedValue(axiosError);
    }, 15000);

    it('should propagate errors from warning() helper', async () => {
      const axiosError = new AxiosError('Server Error');
      axiosError.response = {
        status: 500,
        data: {},
        statusText: 'Internal Server Error',
        headers: {},
        config: {} as any,
      };

      mockAxiosInstance.request.mockRejectedValueOnce(axiosError);

      try {
        await webhook.warning('Warning Title');
        fail('Expected to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(WebhookError);
        const details = (error as WebhookError).details as any[];
        const requestError = details[0].error as RequestError;
        expect(requestError.status).toBe(500);
      }
    });

    it('should propagate errors from error() helper', async () => {
      const axiosError = new AxiosError('Not Found');
      axiosError.response = {
        status: 404,
        data: {
          message: 'Webhook not found',
        },
        statusText: 'Not Found',
        headers: {},
        config: {} as any,
      };

      mockAxiosInstance.request.mockRejectedValueOnce(axiosError);

      try {
        await webhook.error('Error Title');
        fail('Expected to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(WebhookError);
        const details = (error as WebhookError).details as any[];
        const requestError = details[0].error as RequestError;
        expect(requestError.status).toBe(404);
      }
    });
  });

  describe('Edit and Delete Error Handling', () => {
    it('should handle error when editing non-existent message', async () => {
      const message = new Message({
        content: 'Edited content',
        editTarget: '9999999999999999999',
      });
      webhook.addMessage(message);

      const axiosError = new AxiosError('Not Found');
      axiosError.response = {
        status: 404,
        data: {
          message: 'Unknown Message',
        },
        statusText: 'Not Found',
        headers: {},
        config: {} as any,
      };

      mockAxiosInstance.request.mockRejectedValueOnce(axiosError);

      try {
        await webhook.send();
        fail('Expected to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(WebhookError);
        const details = (error as WebhookError).details as any[];
        const requestError = details[0].error as RequestError;
        expect(requestError.status).toBe(404);
      }
    });

    it('should handle error when deleting non-existent message', async () => {
      const axiosError = new AxiosError('Not Found');
      axiosError.response = {
        status: 404,
        data: {
          message: 'Unknown Message',
        },
        statusText: 'Not Found',
        headers: {},
        config: {} as any,
      };

      mockAxiosInstance.request.mockRejectedValueOnce(axiosError);

      try {
        await webhook.delete('9999999999999999999');
        fail('Expected to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(WebhookError);
        const details = (error as WebhookError).details as any[];
        const requestError = details[0].error as RequestError;
        expect(requestError.status).toBe(404);
      }
    });
  });

  describe('Multiple Webhooks Error Handling', () => {
    it('should handle partial failures across multiple webhooks', async () => {
      const WEBHOOK_URL_2 =
        'https://discord.com/api/webhooks/987654321098765432/zyxwvutsrqponmlkjihgfedcbaZYXWVUTSRQPONMLKJIHGFEDCBA9876543210';

      webhook.addWebhookUrl(WEBHOOK_URL_2);

      const message = new Message({ content: 'Multi-webhook test' });
      webhook.addMessage(message);

      // First webhook succeeds, second fails
      mockAxiosInstance.request
        .mockResolvedValueOnce({
          data: {},
          status: 204,
          statusText: 'No Content',
          headers: {},
          config: {} as any,
        })
        .mockRejectedValueOnce(new Error('Network error'));
    });

    it('should handle all webhooks failing', async () => {
      const WEBHOOK_URL_2 =
        'https://discord.com/api/webhooks/987654321098765432/zyxwvutsrqponmlkjihgfedcbaZYXWVUTSRQPONMLKJIHGFEDCBA9876543210';

      webhook.addWebhookUrl(WEBHOOK_URL_2);

      const message = new Message({ content: 'Multi-webhook test' });
      webhook.addMessage(message);

      const axiosError = new AxiosError('Bad Request');
      axiosError.response = {
        status: 400,
        data: {
          message: 'Invalid payload',
        },
        statusText: 'Bad Request',
        headers: {},
        config: {} as any,
      };

      // Both webhooks fail
      mockAxiosInstance.request.mockRejectedValue(axiosError);
    });
  });

  describe('Edge Cases and Complex Scenarios', () => {
    it('should handle error with embed in message', async () => {
      const embed = new Embed()
        .setTitle('Test Embed')
        .setDescription('Test Description');

      const message = new Message({ embeds: [embed] });
      webhook.addMessage(message);

      const axiosError = new AxiosError('Bad Request');
      axiosError.response = {
        status: 400,
        data: {
          code: 50035,
          message: 'Invalid Form Body',
          errors: {
            embeds: {
              '0': {
                title: {
                  _errors: [
                    {
                      code: 'BASE_TYPE_BAD_LENGTH',
                      message: 'Must be 256 or fewer in length',
                    },
                  ],
                },
              },
            },
          },
        },
        statusText: 'Bad Request',
        headers: {},
        config: {} as any,
      };

      mockAxiosInstance.request.mockRejectedValueOnce(axiosError);

      try {
        await webhook.send();
        fail('Expected to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(WebhookError);
        const details = (error as WebhookError).details as any[];
        expect(details[0].error).toBeInstanceOf(RequestError);
        expect((details[0].error as RequestError).status).toBe(400);
        expect((details[0].error as RequestError).code).toBe(50035);
      }
    });

    it('should handle error on batch send with multiple messages', async () => {
      const message1 = new Message({ content: 'Message 1' });
      const message2 = new Message({ content: 'Message 2' });

      webhook.addMessage(message1).addMessage(message2);

      const axiosError = new AxiosError('Rate Limited');
      axiosError.response = {
        status: 429,
        data: {
          retry_after: 0.1,
          message: 'Rate limited',
        },
        statusText: 'Too Many Requests',
        headers: {},
        config: {} as any,
      };

      // All requests fail with rate limit
      mockAxiosInstance.request.mockRejectedValue(axiosError);

      expect(webhook.getPayloads().length).toBeGreaterThan(0); // Messages remain in queue
    }, 15000);
  });

  describe('Additional HTTP Error Status Codes', () => {
    it('should handle 401 Unauthorized errors', async () => {
      const message = new Message({ content: 'Test message' });
      webhook.addMessage(message);

      const axiosError = new AxiosError('Unauthorized');
      axiosError.response = {
        status: 401,
        data: {
          message: 'Invalid webhook token',
          code: 0,
        },
        statusText: 'Unauthorized',
        headers: {},
        config: {} as any,
      };

      mockAxiosInstance.request.mockRejectedValueOnce(axiosError);

      try {
        await webhook.send();
        fail('Expected to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(WebhookError);
        const details = (error as WebhookError).details as any[];
        expect(details[0].error).toBeInstanceOf(RequestError);
        expect((details[0].error as RequestError).status).toBe(401);
      }
    });

    it('should handle 403 Forbidden errors', async () => {
      const message = new Message({ content: 'Test message' });
      webhook.addMessage(message);

      const axiosError = new AxiosError('Forbidden');
      axiosError.response = {
        status: 403,
        data: {
          message: 'Missing permissions',
          code: 50013,
        },
        statusText: 'Forbidden',
        headers: {},
        config: {} as any,
      };

      mockAxiosInstance.request.mockRejectedValueOnce(axiosError);

      try {
        await webhook.send();
        fail('Expected to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(WebhookError);
        const details = (error as WebhookError).details as any[];
        expect(details[0].error).toBeInstanceOf(RequestError);
        expect((details[0].error as RequestError).status).toBe(403);
        expect((details[0].error as RequestError).code).toBe(50013);
      }
    });

    it('should handle 502 Bad Gateway errors', async () => {
      const message = new Message({ content: 'Test message' });
      webhook.addMessage(message);

      const axiosError = new AxiosError('Bad Gateway');
      axiosError.response = {
        status: 502,
        data: {
          message: 'Bad gateway',
        },
        statusText: 'Bad Gateway',
        headers: {},
        config: {} as any,
      };

      mockAxiosInstance.request.mockRejectedValueOnce(axiosError);

      try {
        await webhook.send();
        fail('Expected to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(WebhookError);
        const details = (error as WebhookError).details as any[];
        expect(details[0].error).toBeInstanceOf(RequestError);
        expect((details[0].error as RequestError).status).toBe(502);
      }
    });

    it('should handle 504 Gateway Timeout errors', async () => {
      const message = new Message({ content: 'Test message' });
      webhook.addMessage(message);

      const axiosError = new AxiosError('Gateway Timeout');
      axiosError.response = {
        status: 504,
        data: {
          message: 'Gateway timeout',
        },
        statusText: 'Gateway Timeout',
        headers: {},
        config: {} as any,
      };

      mockAxiosInstance.request.mockRejectedValueOnce(axiosError);

      try {
        await webhook.send();
        fail('Expected to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(WebhookError);
        const details = (error as WebhookError).details as any[];
        expect(details[0].error).toBeInstanceOf(RequestError);
        expect((details[0].error as RequestError).status).toBe(504);
      }
    });

    it('should handle 413 Payload Too Large errors', async () => {
      const message = new Message({ content: 'Test message' });
      webhook.addMessage(message);

      const axiosError = new AxiosError('Payload Too Large');
      axiosError.response = {
        status: 413,
        data: {
          message: 'Request entity too large',
        },
        statusText: 'Payload Too Large',
        headers: {},
        config: {} as any,
      };

      mockAxiosInstance.request.mockRejectedValueOnce(axiosError);

      try {
        await webhook.send();
        fail('Expected to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(WebhookError);
        const details = (error as WebhookError).details as any[];
        expect(details[0].error).toBeInstanceOf(RequestError);
        expect((details[0].error as RequestError).status).toBe(413);
      }
    });

    it('should handle generic 5xx server errors', async () => {
      const message = new Message({ content: 'Test message' });
      webhook.addMessage(message);

      const axiosError = new AxiosError('Internal Server Error');
      axiosError.response = {
        status: 599,
        data: {
          message: 'Unknown server error',
        },
        statusText: 'Unknown Error',
        headers: {},
        config: {} as any,
      };

      mockAxiosInstance.request.mockRejectedValueOnce(axiosError);

      try {
        await webhook.send();
        fail('Expected to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(WebhookError);
        const details = (error as WebhookError).details as any[];
        expect(details[0].error).toBeInstanceOf(RequestError);
        expect((details[0].error as RequestError).status).toBe(599);
      }
    });

    it('should handle errors with missing response data', async () => {
      const message = new Message({ content: 'Test message' });
      webhook.addMessage(message);

      const axiosError = new AxiosError('Unknown Error');
      axiosError.response = {
        status: 500,
        data: null,
        statusText: 'Internal Server Error',
        headers: {},
        config: {} as any,
      };

      mockAxiosInstance.request.mockRejectedValueOnce(axiosError);

      try {
        await webhook.send();
        fail('Expected to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(WebhookError);
        const details = (error as WebhookError).details as any[];
        expect(details[0].error).toBeInstanceOf(RequestError);
        expect((details[0].error as RequestError).status).toBe(500);
      }
    });

    it('should handle errors with empty response data', async () => {
      const message = new Message({ content: 'Test message' });
      webhook.addMessage(message);

      const axiosError = new AxiosError('Unknown Error');
      axiosError.response = {
        status: 500,
        data: {},
        statusText: 'Internal Server Error',
        headers: {},
        config: {} as any,
      };

      mockAxiosInstance.request.mockRejectedValueOnce(axiosError);

      try {
        await webhook.send();
        fail('Expected to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(WebhookError);
        const details = (error as WebhookError).details as any[];
        expect(details[0].error).toBeInstanceOf(RequestError);
        expect((details[0].error as RequestError).status).toBe(500);
      }
    });

    it('should handle 429 with missing retry_after', async () => {
      const message = new Message({ content: 'Test message' });
      webhook.addMessage(message);

      const axiosError = new AxiosError('Rate Limited');
      axiosError.response = {
        status: 429,
        data: {
          message: 'Rate limited',
        },
        statusText: 'Too Many Requests',
        headers: {},
        config: {} as any,
      };

      // Mock to fail once, then succeed
      mockAxiosInstance.request
        .mockRejectedValueOnce(axiosError)
        .mockResolvedValueOnce({
          data: {},
          status: 204,
          statusText: 'No Content',
          headers: {},
          config: {},
        });

      // Should retry and succeed
      await expect(webhook.send()).resolves.not.toThrow();
    });

    it('should handle 400 with field-specific errors', async () => {
      const message = new Message({ content: 'Test message' });
      webhook.addMessage(message);

      const axiosError = new AxiosError('Bad Request');
      axiosError.response = {
        status: 400,
        data: {
          code: 50035,
          message: 'Invalid Form Body',
          errors: {
            embeds: {
              0: {
                description: {
                  _errors: [
                    {
                      code: 'BASE_TYPE_MAX_LENGTH',
                      message: 'Must be 4096 or fewer in length.',
                    },
                  ],
                },
              },
            },
          },
        },
        statusText: 'Bad Request',
        headers: {},
        config: {} as any,
      };

      mockAxiosInstance.request.mockRejectedValueOnce(axiosError);

      try {
        await webhook.send();
        fail('Expected to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(WebhookError);
        const webhookError = error as WebhookError;
        expect(webhookError.details).toBeDefined();
        expect(webhookError.details!.length).toBeGreaterThan(0);

        const reqError = webhookError.details![0].error as RequestError;
        expect(reqError).toBeInstanceOf(RequestError);
        expect(reqError.status).toBe(400);
        // discordErrorCode is a number in the response, converted to string in code
        expect(reqError.code).toBe(50035);
        expect(reqError.message).toContain('Invalid Form Body');
      }
    });
  });
});
