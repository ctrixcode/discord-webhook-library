import { Embed } from './Embed';

interface MessageOptions {
  content?: string;
  username?: string;
  avatar_url?: string;
  tts?: boolean;
  embeds?: Embed[];
  thread_name?: string;
  flags?: number;
  editTarget?: string;
}

export class Message {
  public content?: string;
  public username?: string;
  public avatar_url?: string;
  public tts?: boolean;
  public embeds: Embed[] = [];
  public thread_name?: string;
  public flags?: number;
  public editTarget?: string;

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

  public setContent(content: string) {
    this.content = content;
    return this;
  }

  public setUsername(username: string) {
    this.username = username;
    return this;
  }

  public setAvatarURL(url: string) {
    this.avatar_url = url;
    return this;
  }

  public setTTS(tts: boolean) {
    this.tts = tts;
    return this;
  }

  public addEmbed(embed: Embed) {
    this.embeds.push(embed);
    return this;
  }

  public addEmbeds(embeds: Embed[]) {
    this.embeds.push(...embeds);
    return this;
  }

  public setThreadName(name: string) {
    this.thread_name = name;
    return this;
  }

  public setFlags(flags: number) {
    this.flags = flags;
    return this;
  }

  public setEditTarget(messageLink: string) {
    this.editTarget = messageLink;
    return this;
  }

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
