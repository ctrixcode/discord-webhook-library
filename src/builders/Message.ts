import { Embed } from './Embed';

/**
 * Options used to initialize or update a `Message`.
 */
export interface MessageOptions {
  content?: string;
  username?: string;
  avatar_url?: string;
  tts?: boolean;
  embeds?: Embed[];
  thread_name?: string;
  flags?: number;
  editTarget?: string;
}

/**
 * Builder for Discord webhook message payloads.
 *
 * Chain setters to construct complex messages, then pass the instance to
 * `Webhook.addMessage` or call `getPayload` to inspect the raw object.
 */
export class Message {
  /** Main text content to send (max 2000 characters). */
  public content?: string;
  /** Override webhook display name for this message. */
  public username?: string;
  /** Override webhook avatar URL for this message. */
  public avatar_url?: string;
  /** If true, message will be read via text-to-speech. */
  public tts?: boolean;
  /** Embeds to include with the message (max 10). */
  public embeds: Embed[] = [];
  /** Forum thread name to create when posting in forum channels. */
  public thread_name?: string;
  /** Advanced message flags bitfield. */
  public flags?: number;
  /** Target message link or ID to edit when sending this payload. */
  public editTarget?: string;

  /**
   * Creates a new Message instance.
   * @param options Optional initial properties for the message.
   * @param options.content The main text content of the message.
   * @param options.username Overrides the default username of the webhook for this message.
   * @param options.avatar_url Overrides the default avatar of the webhook for this message.
   * @param options.tts If true, the message will be read aloud using text-to-speech.
   * @param options.embeds An array of Embed objects to include in the message.
   * @param options.thread_name If the webhook is in a forum channel, this will create a new thread with this name.
   * @param options.flags Advanced message flags.
   * @param options.editTarget The message link or ID to edit an existing message.
   */
  constructor(options?: MessageOptions) {
    if (options) {
      this.content = options.content;
      this.username = options.username;
      this.avatar_url = options.avatar_url;
      this.tts = options.tts;
      if (options.embeds) this.embeds = options.embeds;
      this.thread_name = options.thread_name;
      this.flags = options.flags;
      this.editTarget = options.editTarget;
    }
  }

  /**
   * Sets the main text content of the message.
   * @param content The text content (max 2000 characters). Markdown is supported.
   * @returns The current Message instance.
   */
  public setContent(content: string) {
    this.content = content;
    return this;
  }

  /**
   * Overrides the default username of the webhook for this specific message.
   * @param username The username to display.
   * @returns The current Message instance.
   */
  public setUsername(username: string) {
    this.username = username;
    return this;
  }

  /**
   * Overrides the default avatar of the webhook for this specific message.
   * @param url The URL for the avatar image. Must be a valid image URL.
   * @returns The current Message instance.
   */
  public setAvatarURL(url: string) {
    this.avatar_url = url;
    return this;
  }

  /**
   * Sets whether the message should be read aloud using text-to-speech.
   * @param tts If true, the message will be read aloud.
   * @returns The current Message instance.
   */
  public setTTS(tts: boolean) {
    this.tts = tts;
    return this;
  }

  /**
   * Adds a single embed to the message.
   * @param embed The Embed object to add.
   * @returns The current Message instance.
   */
  public addEmbed(embed: Embed) {
    this.embeds.push(embed);
    return this;
  }

  /**
   * Adds multiple embeds to the message.
   * @param embeds An array of Embed objects to add.
   * @returns The current Message instance.
   */
  public addEmbeds(embeds: Embed[]) {
    this.embeds.push(...embeds);
    return this;
  }

  /**
   * Sets the name of the thread to create if the webhook is in a forum channel.
   * @param name The name of the new thread.
   * @returns The current Message instance.
   */
  public setThreadName(name: string) {
    this.thread_name = name;
    return this;
  }

  /**
   * Sets advanced message flags.
   * @param flags The bitwise flags for the message.
   * @returns The current Message instance.
   */
  public setFlags(flags: number) {
    this.flags = flags;
    return this;
  }

  /**
   * Sets the target message to edit.
   * @param messageLink The full message link or message ID of the message to edit.
   * @returns The current Message instance.
   */
  public setEditTarget(messageLink: string) {
    this.editTarget = messageLink;
    return this;
  }

  /**
   * Returns the JSON payload for the message.
   * @returns A plain object representing the message's payload.
   */
  /**
   * Produce the Discord-compatible JSON payload for this message.
   */
  getPayload() {
    const payload: Record<string, unknown> = {};
    if (this.content) payload.content = this.content;
    if (this.username) payload.username = this.username;
    if (this.avatar_url) payload.avatar_url = this.avatar_url;
    if (this.tts) payload.tts = this.tts;
    if (this.embeds.length > 0)
      payload.embeds = this.embeds.map((embed) => embed.toJSON());
    if (this.thread_name) payload.thread_name = this.thread_name;
    if (this.flags) payload.flags = this.flags;
    return payload;
  }
}
