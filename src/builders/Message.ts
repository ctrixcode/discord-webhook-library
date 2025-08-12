import { Embed } from './Embed';

export class Message {
  public content?: string;
  public username?: string;
  public avatar_url?: string;
  public tts?: boolean;
  public embeds: Embed[] = [];
  public thread_name?: string;
  public flags?: number;
  public editTarget?: string; // Stores the message link for editing

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
}
