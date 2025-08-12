export class Field {
  public name: string;
  public value: string;
  public inline?: boolean;

  /**
   * Creates a new Field instance for an embed.
   * @param name The name of the field (max 256 characters).
   * @param value The value of the field (max 1024 characters).
   * @param inline Optional. Whether the field should be displayed inline with other fields.
   */
  constructor(name: string, value: string, inline?: boolean) {
    this.name = name;
    this.value = value;
    this.inline = inline;
  }

  /**
   * Returns the JSON representation of the field.
   * @returns A plain object representing the field's payload.
   */
  toJSON() {
    return {
      name: this.name,
      value: this.value,
      inline: this.inline,
    };
  }
}
