export class Footer {
  public text: string;
  public icon_url?: string;

  /**
   * Creates a new Footer instance for an embed.
   * @param text The text to display in the footer (max 2048 characters).
   * @param icon_url Optional URL for a small icon next to the text.
   */
  constructor(text: string, icon_url?: string) {
    this.text = text;
    this.icon_url = icon_url;
  }

  /**
   * Returns the JSON representation of the footer.
   * @returns A plain object representing the footer's payload.
   */
  toJSON() {
    return {
      text: this.text,
      icon_url: this.icon_url,
    };
  }
}
