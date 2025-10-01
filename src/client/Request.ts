import { AxiosError, AxiosInstance } from 'axios';
import { RequestError } from '../errors';

/**
 * Delays the execution of the code for a specified number of seconds.
 * @param second - The number of seconds to delay.
 * @returns A Promise that resolves after the specified number of seconds.
 */
/**
 * Delay helper for retry/backoff logic.
 *
 * Useful for respecting Discord rate limits and retry-after headers.
 * @param second Number of seconds to wait.
 */
export function delay(second: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, second * 1000);
  });
}

/**
 * Class for handling HTTP requests with customizable headers, body, and parameters.
 *
 * @class
 * @internal
 * @category Internal
 */
/**
 * Lightweight HTTP client wrapper around Axios with Discord-focused error and rate-limit handling.
 *
 * This class is used internally by `Webhook` to interact with Discord's Webhook API.
 */
export class Request {
  /**
   * The number of request attempts made.
   */
  private retries = 1;

  /**
   * Create a request helper bound to a specific Axios instance (baseURL, headers).
   * @param client Pre-configured Axios instance.
   */
  constructor(private client: AxiosInstance) {}

  /**
   * Send the HTTP request.
   *
   * @param method - The HTTP method to use. Defaults to 'GET'.
   * @param data - The data to send with the request.
   * @param headers - Optional headers for the request.
   * @param url - Optional URL for the request. If not provided, axios baseURL will be used.
   * @returns A Promise that resolves with the response data, or rejects with an Error if an error occurs.
   * @throws {Error} if an error occurs.
   */
  /**
   * Send an HTTP request with retries and rich error translation.
   *
   * - Handles 429 rate limits via retry-after semantics up to a safe cap
   * - Maps common Discord API error shapes to typed `RequestError`
   *
   * @param method HTTP method to use. Defaults to 'GET'.
   * @param data Optional request payload (JSON or FormData).
   * @param headers Optional request headers.
   * @param url Optional request path. Falls back to Axios baseURL when omitted.
   * @returns The parsed response body, or `undefined` for 204 responses.
   * @throws {RequestError} On HTTP failures or unrecoverable rate limiting.
   */
  public async send(
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
    data?: unknown,
    headers?: Record<string, string>,
    url?: string
  ): Promise<unknown> {
    try {
      const request = await this.client.request({
        method,
        url,
        data,
        headers,
      });

      // Basic rate-limiting handling (Discord specific: 429 status, x-ratelimit-reset-after header)
      if (request.status === 429 && this.retries <= 60) {
        this.retries++;
        const retryAfter = parseInt(
          request.headers['x-ratelimit-reset-after'] ?? '3',
          10
        );
        await delay(retryAfter);
        return this.send(method, data, headers, url);
      }

      this.retries = 1;
      if (request.status === 204) {
        return undefined; // No Content
      }
      return request.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const discordErrorMessage = error.response?.data?.message as
          | string
          | undefined;
        const discordErrorCode = error.response?.data?.code as
          | string
          | undefined;
        const discordErrorErrors = error.response?.data?.errors; // For 50035 errors

        // Handle 429 Too Many Requests (Rate Limit)
        if (error.response?.status === 429) {
          const retryAfter =
            error.response?.data?.retry_after ||
            parseInt(
              error.response?.headers?.['x-ratelimit-reset-after'] ?? '3',
              10
            );

          if (this.retries <= 60) {
            // Use the existing retry limit
            this.retries++;
            await delay(retryAfter);
            return this.send(method, data, headers, url);
          } else {
            throw new RequestError(
              `Rate limit exceeded after ${this.retries - 1} retries.`,
              429,
              discordErrorMessage,
              'RATE_LIMIT_EXCEEDED'
            );
          }
        }

        // Handle other 4xx errors
        switch (error.response?.status) {
          case 400: {
            let errorMessage400 = 'Bad Request.';
            if (Number(discordErrorCode) === 50035) {
              errorMessage400 = `Invalid Form Body: ${JSON.stringify(discordErrorErrors)}`;
            } else if (discordErrorMessage) {
              errorMessage400 = `Bad Request: ${discordErrorMessage}`;
            }
            throw new RequestError(
              errorMessage400,
              400,
              discordErrorMessage,
              discordErrorCode || 'BAD_REQUEST'
            );
          }
          case 401: {
            throw new RequestError(
              'Unauthorized: Invalid or missing Authorization header.',
              401,
              discordErrorMessage,
              discordErrorCode || 'UNAUTHORIZED'
            );
          }
          case 403: {
            throw new RequestError(
              'Forbidden: You do not have permission to perform this action.',
              403,
              discordErrorMessage,
              discordErrorCode || 'FORBIDDEN'
            );
          }
          case 404: {
            throw new RequestError(
              'Webhook not found or invalid.',
              404,
              discordErrorMessage,
              discordErrorCode || 'WEBHOOK_NOT_FOUND'
            );
          }
          case 413: {
            throw new RequestError(
              "Payload Too Large: The request payload exceeds Discord's size limit.",
              413,
              discordErrorMessage,
              discordErrorCode || 'PAYLOAD_TOO_LARGE'
            );
          }
          default: {
            throw new RequestError(
              `Request failed with status ${error.response?.status || 'unknown'}: ${discordErrorMessage || error.message}`,
              error.response?.status,
              discordErrorMessage,
              discordErrorCode || 'UNKNOWN_REQUEST_ERROR'
            );
          }
        }
      } else {
        throw new RequestError(`An unknown error occurred: ${String(error)}`);
      }
    }
  }
}
