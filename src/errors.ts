import { ZodError } from 'zod';

/**
 * Base error class for all custom errors in the Discord Webhook Library.
 */
export class WebhookError extends Error {
  public code: string;

  constructor(message: string, code: string = 'WEBHOOK_ERROR') {
    super(message);
    this.name = 'WebhookError';
    this.code = code;
    Object.setPrototypeOf(this, WebhookError.prototype);
  }
}

/**
 * Error class for validation failures, typically wrapping Zod errors.
 */
export class ValidationError extends WebhookError {
  public issues: ZodError['issues'] | null;

  constructor(message: string, issues: ZodError['issues'] | null = null) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
    this.issues = issues;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  /**
   * Formats Zod issues into a more readable string.
   */
  public formatIssues(): string {
    if (!this.issues || this.issues.length === 0) {
      return '';
    }
    return this.issues
      .map((issue) => {
        const path = issue.path.join('.');
        return path ? `${path}: ${issue.message}` : issue.message;
      })
      .join('; ');
  }
}

/**
 * Error class for issues during HTTP requests to the Discord API.
 */
export class RequestError extends WebhookError {
  public status: number | undefined;
  public discordMessage: string | undefined;

  constructor(
    message: string,
    status?: number,
    discordMessage?: string,
    code: string = 'REQUEST_ERROR'
  ) {
    super(message, code);
    this.name = 'RequestError';
    this.status = status;
    this.discordMessage = discordMessage;
    Object.setPrototypeOf(this, RequestError.prototype);
  }
}

/**
 * Error class for file system related operations.
 */
export class FileSystemError extends WebhookError {
  constructor(message: string, code: string = 'FILE_SYSTEM_ERROR') {
    super(message, code);
    this.name = 'FileSystemError';
    Object.setPrototypeOf(this, FileSystemError.prototype);
  }
}
