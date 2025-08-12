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

  /**
   * Sets the title of the embed.
   * @param title The title of the embed.
   * @returns The current Embed instance.
   */
  public setTitle(title: string) {
    this.title = title;
    return this;
  }

  /**
   * Sets the description of the embed.
   * @param description The description of the embed.
   * @returns The current Embed instance.
   */
  public setDescription(description: string) {
    this.description = description;
    return this;
  }

  /**
   * Sets the URL that the title will link to.
   * @param url The URL for the title.
   * @returns The current Embed instance.
   */
  public setURL(url: string) {
    this.url = url;
    return this;
  }

  /**
   * Sets the color of the embed.
   * @param color The color of the embed as a hexadecimal number (e.g., 0x0099ff).
   * @returns The current Embed instance.
   */
  public setColor(color: number) {
    this.color = color;
    return this;
  }

  /**
   * Sets the timestamp of the embed.
   * @param timestamp An optional Date object. If not provided, the current date and time will be used.
   * @returns The current Embed instance.
   */
  public setTimestamp(timestamp: Date = new Date()) {
    this.timestamp = timestamp.toISOString();
    return this;
  }

  /**
   * Sets the author of the embed.
   * @param author An object containing the author's name, and optionally a URL and icon URL.
   * @param author.name The name of the author.
   * @param author.url Optional URL for the author's name.
   * @param author.icon_url Optional URL for the author's icon.
   * @returns The current Embed instance.
   */
  public setAuthor(author: AuthorOptions) {
    this.author = author;
    return this;
  }

  /**
   * Sets the footer of the embed.
   * @param footer An object containing the footer text and optionally an icon URL.
   * @param footer.text The text for the footer.
   * @param footer.icon_url Optional URL for the footer's icon.
   * @returns The current Embed instance.
   */
  public setFooter(footer: { text: string; icon_url?: string }) {
    this.footer = new Footer(footer.text, footer.icon_url);
    return this;
  }

  /**
   * Sets the main image of the embed.
   * @param url The URL of the image.
   * @returns The current Embed instance.
   */
  public setImage(url: string) {
    this.image = new Image(url);
    return this;
  }

  /**
   * Sets the thumbnail image of the embed.
   * @param url The URL of the thumbnail image.
   * @returns The current Embed instance.
   */
  public setThumbnail(url: string) {
    this.thumbnail = new Thumbnail(url);
    return this;
  }

  /**
   * Adds a single field to the embed.
   * @param field The Field object to add.
   * @returns The current Embed instance.
   */
  public addField(field: Field) {
    this.fields.push(field);
    return this;
  }

  /**
   * Adds multiple fields to the embed.
   * @param fields An array of Field objects to add.
   * @returns The current Embed instance.
   */
  public addFields(fields: Field[]) {
    this.fields.push(...fields);
    return this;
  }

  /**
   * Returns the JSON representation of the embed.
   * @returns A plain object representing the embed's payload.
   */
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
