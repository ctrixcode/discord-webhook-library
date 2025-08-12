export class Image {
  public url: string;

  /**
   * Creates a new Image instance for an embed.
   * @param url The URL for the image.
   */
  constructor(url: string) {
    this.url = url;
  }

  /**
   * Returns the JSON representation of the image.
   * @returns A plain object representing the image's payload.
   */
  toJSON() {
    return {
      url: this.url,
    };
  }
}
