/**
 * Thumbnail image displayed to the right of an embed content block.
 */
export class Thumbnail {
  /** Direct URL of the thumbnail image. */
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
  /**
   * Produce the JSON representation expected by Discord's API.
   */
  toJSON() {
    return {
      url: this.url,
    };
  }
}
