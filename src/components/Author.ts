export class Author {
  public name: string;
  public url?: string;
  public icon_url?: string;

  constructor(name: string, url?: string, icon_url?: string) {
    this.name = name;
    this.url = url;
    this.icon_url = icon_url;
  }
}
