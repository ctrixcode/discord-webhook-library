import { Field } from '../components/Field';
import { Footer } from '../components/Footer';
import { Image } from '../components/Image';
import { Thumbnail } from '../components/Thumbnail';

interface AuthorOptions {
  name: string;
  url?: string;
  icon_url?: string;
}

export class Embed {
  public title?: string;
  public description?: string;
  public url?: string;
  public color?: number;
  public timestamp?: string;
  public author?: AuthorOptions;
  public footer?: Footer;
  public image?: Image;
  public thumbnail?: Thumbnail;
  public fields: Field[] = [];

  public setTitle(title: string) {
    this.title = title;
    return this;
  }

  public setDescription(description: string) {
    this.description = description;
    return this;
  }

  public setURL(url: string) {
    this.url = url;
    return this;
  }

  public setColor(color: number) {
    this.color = color;
    return this;
  }

  public setTimestamp(timestamp: Date = new Date()) {
    this.timestamp = timestamp.toISOString();
    return this;
  }

  public setAuthor(author: AuthorOptions) {
    this.author = author;
    return this;
  }

  public setFooter(footer: { text: string; icon_url?: string }) {
    this.footer = new Footer(footer.text, footer.icon_url);
    return this;
  }

  public setImage(url: string) {
    this.image = new Image(url);
    return this;
  }

  public setThumbnail(url: string) {
    this.thumbnail = new Thumbnail(url);
    return this;
  }

  public addField(field: Field) {
    this.fields.push(field);
    return this;
  }

  public addFields(fields: Field[]) {
    this.fields.push(...fields);
    return this;
  }

  toJSON() {
    return {
      title: this.title,
      description: this.description,
      url: this.url,
      color: this.color,
      timestamp: this.timestamp,
      author: this.author,
      footer: this.footer ? this.footer.toJSON() : undefined,
      image: this.image ? this.image.toJSON() : undefined,
      thumbnail: this.thumbnail ? this.thumbnail.toJSON() : undefined,
      fields: this.fields.map((field) => field.toJSON()),
    };
  }
}
