export class Thumbnail {
  public url: string;

  /**
   * Creates a new Thumbnail instance for an embed.
   * @param url The URL for the thumbnail image.
   */
  constructor(url: string) {
    this.url = url;
  }

  /**
   * Returns the JSON representation of the thumbnail.
   * @returns A plain object representing the thumbnail's payload.
   */
  toJSON() {
    return {
      url: this.url,
    };
  }
}
