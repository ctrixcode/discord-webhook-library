/**
 * Main image displayed within an embed.
 */
export class Image {
  /** Direct URL of the image. */
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
  /**
   * Produce the JSON representation expected by Discord's API.
   */
  toJSON() {
    return {
      url: this.url,
    };
  }
}
