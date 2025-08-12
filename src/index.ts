import { Webhook } from './client/Webhook';
import { Message } from './builders/Message';
import { Embed } from './builders/Embed';
import { Field } from './components/Field';
import { Footer } from './components/Footer';
import { Image } from './components/Image';
import { Thumbnail } from './components/Thumbnail';

/**
 * Creates a new Webhook instance.
 * @param url The full Discord webhook URL.
 * @returns A new Webhook instance.
 */
export function createWebhook(url: string): Webhook {
  return new Webhook(url);
}

export { Message, Embed, Field, Footer, Image, Thumbnail, Webhook };
