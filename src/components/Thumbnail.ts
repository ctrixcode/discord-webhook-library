export class Thumbnail {
  public url: string;

  constructor(url: string) {
    this.url = url;
  }

  toJSON() {
    return {
      url: this.url,
    };
  }
}
