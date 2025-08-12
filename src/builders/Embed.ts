import { Author } from '../components/Author';
import { Field } from '../components/Field';
import { Footer } from '../components/Footer';
import { Image } from '../components/Image';
import { Thumbnail } from '../components/Thumbnail';

export class Embed {
  public title?: string;
  public description?: string;
  public url?: string;
  public color?: number;
  public timestamp?: string;
  public author?: Author;
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

  public setAuthor(author: Author) {
    this.author = author;
    return this;
  }

  public setFooter(footer: Footer) {
    this.footer = footer;
    return this;
  }

  public setImage(image: Image) {
    this.image = image;
    return this;
  }

  public setThumbnail(thumbnail: Thumbnail) {
    this.thumbnail = thumbnail;
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
}
