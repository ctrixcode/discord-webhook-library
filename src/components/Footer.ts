export class Footer {
  public text: string;
  public icon_url?: string;

  constructor(text: string, icon_url?: string) {
    this.text = text;
    this.icon_url = icon_url;
  }
}
