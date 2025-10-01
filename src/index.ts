import { Webhook, WebhookInstance } from './client/Webhook';
import { Message, MessageOptions } from './builders/Message';
import { Embed, AuthorOptions } from './builders/Embed';
import { Field } from './components/Field';
import { Footer } from './components/Footer';
import { Image } from './components/Image';
import { Thumbnail } from './components/Thumbnail';
import {
  WebhookError,
  ValidationError,
  RequestError,
  FileSystemError,
  SendFailureDetail,
} from './errors';

/**
 * Factory to create a `Webhook` client.
 * @param url Optional full Discord webhook URL or an array of URLs.
 * @returns A new `Webhook` instance.
 */
export function createWebhook(url?: string | string[]): Webhook {
  return new Webhook(url);
}

export {
  Message,
  Embed,
  Field,
  Footer,
  Image,
  Thumbnail,
  Webhook,
  WebhookError,
  ValidationError,
  RequestError,
  FileSystemError,
};

export type {
  MessageOptions,
  AuthorOptions,
  SendFailureDetail,
  WebhookInstance,
};
