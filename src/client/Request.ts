import { AxiosError, AxiosInstance } from 'axios';

/**
 * Delays the execution of the code for a specified number of seconds.
 * @param second - The number of seconds to delay.
 * @returns A Promise that resolves after the specified number of seconds.
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
export class Request {
  /**
   * The number of request attempts made.
   */
  private retries = 1;

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

      const result = request.data;

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
      return result;
    } catch (error) {
      if (error instanceof AxiosError) {
        // Discord API errors often have a 'message' field in the response data
        const discordErrorMessage =
          error.response?.data?.message || error.message;
        throw new Error(
          `Request Error: [${error.code || error.response?.status}] - ${discordErrorMessage}`
        );
      } else {
        throw new Error(`An unknown error occurred: ${JSON.stringify(error)}`);
      }
    }
  }
}
