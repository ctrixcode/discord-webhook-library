import { Embed } from '../src/builders/Embed';
import { Field } from '../src/components/Field';
import { Footer } from '../src/components/Footer';
import { Image } from '../src/components/Image';
import { Thumbnail } from '../src/components/Thumbnail';
import { DISCORD_COLORS } from '../src/constants/colors';

describe('Embed Builder', () => {
  describe('constructor', () => {
    it('should create an empty Embed instance', () => {
      const embed = new Embed();

      expect(embed.title).toBeUndefined();
      expect(embed.description).toBeUndefined();
      expect(embed.url).toBeUndefined();
      expect(embed.color).toBeUndefined();
      expect(embed.timestamp).toBeUndefined();
      expect(embed.author).toBeUndefined();
      expect(embed.footer).toBeUndefined();
      expect(embed.image).toBeUndefined();
      expect(embed.thumbnail).toBeUndefined();
      expect(embed.fields).toEqual([]);
    });
  });

  describe('setTitle', () => {
    it('should set the title', () => {
      const embed = new Embed();
      embed.setTitle('Test Title');

      expect(embed.title).toBe('Test Title');
    });

    it('should return the Embed instance for chaining', () => {
      const embed = new Embed();
      const result = embed.setTitle('Test Title');

      expect(result).toBe(embed);
    });

    it('should handle maximum length title (256 characters)', () => {
      const embed = new Embed();
      const maxLengthTitle = 'a'.repeat(256);
      embed.setTitle(maxLengthTitle);

      expect(embed.title).toBe(maxLengthTitle);
      expect(embed.title?.length).toBe(256);
    });

    it('should handle empty string', () => {
      const embed = new Embed();
      embed.setTitle('');

      expect(embed.title).toBe('');
    });

    it('should handle special characters and markdown', () => {
      const embed = new Embed();
      embed.setTitle('**Bold** *Italic* ~~Strikethrough~~');

      expect(embed.title).toBe('**Bold** *Italic* ~~Strikethrough~~');
    });
  });

  describe('setDescription', () => {
    it('should set the description', () => {
      const embed = new Embed();
      embed.setDescription('Test Description');

      expect(embed.description).toBe('Test Description');
    });

    it('should return the Embed instance for chaining', () => {
      const embed = new Embed();
      const result = embed.setDescription('Test Description');

      expect(result).toBe(embed);
    });

    it('should handle maximum length description (4096 characters)', () => {
      const embed = new Embed();
      const maxLengthDesc = 'a'.repeat(4096);
      embed.setDescription(maxLengthDesc);

      expect(embed.description).toBe(maxLengthDesc);
      expect(embed.description?.length).toBe(4096);
    });

    it('should handle multiline description', () => {
      const embed = new Embed();
      embed.setDescription('Line 1\nLine 2\nLine 3');

      expect(embed.description).toBe('Line 1\nLine 2\nLine 3');
    });
  });

  describe('setURL', () => {
    it('should set the URL', () => {
      const embed = new Embed();
      embed.setURL('https://example.com');

      expect(embed.url).toBe('https://example.com');
    });

    it('should return the Embed instance for chaining', () => {
      const embed = new Embed();
      const result = embed.setURL('https://example.com');

      expect(result).toBe(embed);
    });

    it('should handle various URL formats', () => {
      const urls = [
        'https://example.com',
        'http://example.com',
        'https://example.com/path/to/page',
        'https://example.com?query=param',
      ];

      urls.forEach((url) => {
        const embed = new Embed();
        embed.setURL(url);
        expect(embed.url).toBe(url);
      });
    });
  });

  describe('setColor', () => {
    it('should set the color', () => {
      const embed = new Embed();
      embed.setColor(0xff0000);

      expect(embed.color).toBe(0xff0000);
    });

    it('should return the Embed instance for chaining', () => {
      const embed = new Embed();
      const result = embed.setColor(0xff0000);

      expect(result).toBe(embed);
    });

    it('should handle Discord color constants', () => {
      const embed = new Embed();
      embed.setColor(DISCORD_COLORS.INFO);

      expect(embed.color).toBe(DISCORD_COLORS.INFO);
    });

    it('should handle minimum color value (0)', () => {
      const embed = new Embed();
      embed.setColor(0);

      expect(embed.color).toBe(0);
    });

    it('should handle maximum color value (16777215)', () => {
      const embed = new Embed();
      embed.setColor(16777215);

      expect(embed.color).toBe(16777215);
    });
  });

  describe('setTimestamp', () => {
    it('should set the timestamp with current date when no argument provided', () => {
      const embed = new Embed();
      const before = new Date();
      embed.setTimestamp();
      const after = new Date();

      expect(embed.timestamp).toBeDefined();
      const timestamp = new Date(embed.timestamp!);
      expect(timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should set the timestamp with provided date', () => {
      const embed = new Embed();
      const date = new Date('2024-01-01T00:00:00.000Z');
      embed.setTimestamp(date);

      expect(embed.timestamp).toBe('2024-01-01T00:00:00.000Z');
    });

    it('should return the Embed instance for chaining', () => {
      const embed = new Embed();
      const result = embed.setTimestamp();

      expect(result).toBe(embed);
    });

    it('should format timestamp in ISO 8601 format', () => {
      const embed = new Embed();
      const date = new Date('2024-06-15T14:30:00.000Z');
      embed.setTimestamp(date);

      expect(embed.timestamp).toBe('2024-06-15T14:30:00.000Z');
    });
  });

  describe('setAuthor', () => {
    it('should set the author with name only', () => {
      const embed = new Embed();
      embed.setAuthor({ name: 'Author Name' });

      expect(embed.author).toEqual({ name: 'Author Name' });
    });

    it('should set the author with all properties', () => {
      const embed = new Embed();
      embed.setAuthor({
        name: 'Author Name',
        url: 'https://example.com',
        icon_url: 'https://example.com/icon.png',
      });

      expect(embed.author).toEqual({
        name: 'Author Name',
        url: 'https://example.com',
        icon_url: 'https://example.com/icon.png',
      });
    });

    it('should return the Embed instance for chaining', () => {
      const embed = new Embed();
      const result = embed.setAuthor({ name: 'Author Name' });

      expect(result).toBe(embed);
    });

    it('should handle maximum length name (256 characters)', () => {
      const embed = new Embed();
      const maxLengthName = 'a'.repeat(256);
      embed.setAuthor({ name: maxLengthName });

      expect(embed.author?.name).toBe(maxLengthName);
      expect(embed.author?.name.length).toBe(256);
    });
  });

  describe('setFooter', () => {
    it('should set the footer with text only', () => {
      const embed = new Embed();
      embed.setFooter({ text: 'Footer Text' });

      expect(embed.footer).toBeInstanceOf(Footer);
      expect(embed.footer?.text).toBe('Footer Text');
    });

    it('should set the footer with text and icon_url', () => {
      const embed = new Embed();
      embed.setFooter({
        text: 'Footer Text',
        icon_url: 'https://example.com/icon.png',
      });

      expect(embed.footer).toBeInstanceOf(Footer);
      expect(embed.footer?.text).toBe('Footer Text');
      expect(embed.footer?.icon_url).toBe('https://example.com/icon.png');
    });

    it('should return the Embed instance for chaining', () => {
      const embed = new Embed();
      const result = embed.setFooter({ text: 'Footer Text' });

      expect(result).toBe(embed);
    });
  });

  describe('setImage', () => {
    it('should set the image', () => {
      const embed = new Embed();
      embed.setImage('https://example.com/image.png');

      expect(embed.image).toBeInstanceOf(Image);
      expect(embed.image?.url).toBe('https://example.com/image.png');
    });

    it('should return the Embed instance for chaining', () => {
      const embed = new Embed();
      const result = embed.setImage('https://example.com/image.png');

      expect(result).toBe(embed);
    });
  });

  describe('setThumbnail', () => {
    it('should set the thumbnail', () => {
      const embed = new Embed();
      embed.setThumbnail('https://example.com/thumb.png');

      expect(embed.thumbnail).toBeInstanceOf(Thumbnail);
      expect(embed.thumbnail?.url).toBe('https://example.com/thumb.png');
    });

    it('should return the Embed instance for chaining', () => {
      const embed = new Embed();
      const result = embed.setThumbnail('https://example.com/thumb.png');

      expect(result).toBe(embed);
    });
  });

  describe('addField', () => {
    it('should add a single field', () => {
      const embed = new Embed();
      const field = new Field('Name', 'Value');
      embed.addField(field);

      expect(embed.fields).toHaveLength(1);
      expect(embed.fields[0]).toBe(field);
    });

    it('should return the Embed instance for chaining', () => {
      const embed = new Embed();
      const field = new Field('Name', 'Value');
      const result = embed.addField(field);

      expect(result).toBe(embed);
    });

    it('should add multiple fields via multiple calls', () => {
      const embed = new Embed();
      const field1 = new Field('Name 1', 'Value 1');
      const field2 = new Field('Name 2', 'Value 2');

      embed.addField(field1).addField(field2);

      expect(embed.fields).toHaveLength(2);
      expect(embed.fields[0]).toBe(field1);
      expect(embed.fields[1]).toBe(field2);
    });
  });

  describe('addFields', () => {
    it('should add multiple fields at once', () => {
      const embed = new Embed();
      const fields = [
        new Field('Name 1', 'Value 1'),
        new Field('Name 2', 'Value 2'),
        new Field('Name 3', 'Value 3'),
      ];

      embed.addFields(fields);

      expect(embed.fields).toHaveLength(3);
      expect(embed.fields).toEqual(fields);
    });

    it('should return the Embed instance for chaining', () => {
      const embed = new Embed();
      const fields = [new Field('Name', 'Value')];
      const result = embed.addFields(fields);

      expect(result).toBe(embed);
    });

    it('should handle empty array', () => {
      const embed = new Embed();
      embed.addFields([]);

      expect(embed.fields).toHaveLength(0);
    });

    it('should append to existing fields', () => {
      const embed = new Embed();
      const field1 = new Field('Name 1', 'Value 1');
      const fields2 = [
        new Field('Name 2', 'Value 2'),
        new Field('Name 3', 'Value 3'),
      ];

      embed.addField(field1).addFields(fields2);

      expect(embed.fields).toHaveLength(3);
    });

    it('should handle up to 25 fields', () => {
      const embed = new Embed();
      const fields = Array.from(
        { length: 25 },
        (_, i) => new Field(`Name ${i + 1}`, `Value ${i + 1}`)
      );

      embed.addFields(fields);

      expect(embed.fields).toHaveLength(25);
    });
  });

  describe('toJSON', () => {
    it('should return empty object for empty embed', () => {
      const embed = new Embed();
      const json = embed.toJSON();

      expect(json).toEqual({
        title: undefined,
        description: undefined,
        url: undefined,
        color: undefined,
        timestamp: undefined,
        author: undefined,
        footer: undefined,
        image: undefined,
        thumbnail: undefined,
        fields: [],
      });
    });

    it('should return correct JSON with all properties', () => {
      const embed = new Embed();
      embed
        .setTitle('Test Title')
        .setDescription('Test Description')
        .setURL('https://example.com')
        .setColor(0xff0000)
        .setTimestamp(new Date('2024-01-01T00:00:00.000Z'))
        .setAuthor({
          name: 'Author',
          url: 'https://author.com',
          icon_url: 'https://author.com/icon.png',
        })
        .setFooter({ text: 'Footer', icon_url: 'https://footer.com/icon.png' })
        .setImage('https://example.com/image.png')
        .setThumbnail('https://example.com/thumb.png')
        .addField(new Field('Field Name', 'Field Value', true));

      const json = embed.toJSON();

      expect(json.title).toBe('Test Title');
      expect(json.description).toBe('Test Description');
      expect(json.url).toBe('https://example.com');
      expect(json.color).toBe(0xff0000);
      expect(json.timestamp).toBe('2024-01-01T00:00:00.000Z');
      expect(json.author).toEqual({
        name: 'Author',
        url: 'https://author.com',
        icon_url: 'https://author.com/icon.png',
      });
      expect(json.footer).toEqual({
        text: 'Footer',
        icon_url: 'https://footer.com/icon.png',
      });
      expect(json.image).toEqual({ url: 'https://example.com/image.png' });
      expect(json.thumbnail).toEqual({ url: 'https://example.com/thumb.png' });
      expect(json.fields).toHaveLength(1);
      expect(json.fields[0]).toEqual({
        name: 'Field Name',
        value: 'Field Value',
        inline: true,
      });
    });

    it('should handle embed with only title', () => {
      const embed = new Embed();
      embed.setTitle('Only Title');

      const json = embed.toJSON();

      expect(json.title).toBe('Only Title');
      expect(json.description).toBeUndefined();
    });

    it('should properly serialize footer component', () => {
      const embed = new Embed();
      embed.setFooter({ text: 'Test Footer' });

      const json = embed.toJSON();

      expect(json.footer).toEqual({ text: 'Test Footer', icon_url: undefined });
    });

    it('should properly serialize image component', () => {
      const embed = new Embed();
      embed.setImage('https://example.com/image.png');

      const json = embed.toJSON();

      expect(json.image).toEqual({ url: 'https://example.com/image.png' });
    });

    it('should properly serialize thumbnail component', () => {
      const embed = new Embed();
      embed.setThumbnail('https://example.com/thumb.png');

      const json = embed.toJSON();

      expect(json.thumbnail).toEqual({ url: 'https://example.com/thumb.png' });
    });

    it('should properly serialize multiple fields', () => {
      const embed = new Embed();
      embed.addFields([
        new Field('Field 1', 'Value 1', true),
        new Field('Field 2', 'Value 2', false),
        new Field('Field 3', 'Value 3'),
      ]);

      const json = embed.toJSON();

      expect(json.fields).toHaveLength(3);
      expect(json.fields[0]).toEqual({
        name: 'Field 1',
        value: 'Value 1',
        inline: true,
      });
      expect(json.fields[1]).toEqual({
        name: 'Field 2',
        value: 'Value 2',
        inline: false,
      });
      expect(json.fields[2]).toEqual({
        name: 'Field 3',
        value: 'Value 3',
        inline: undefined,
      });
    });
  });

  describe('method chaining', () => {
    it('should support full method chaining', () => {
      const embed = new Embed()
        .setTitle('Chained Title')
        .setDescription('Chained Description')
        .setURL('https://example.com')
        .setColor(DISCORD_COLORS.SUCCESS)
        .setTimestamp()
        .setAuthor({ name: 'Chained Author' })
        .setFooter({ text: 'Chained Footer' })
        .setImage('https://example.com/image.png')
        .setThumbnail('https://example.com/thumb.png')
        .addField(new Field('Field 1', 'Value 1'))
        .addField(new Field('Field 2', 'Value 2'));

      expect(embed.title).toBe('Chained Title');
      expect(embed.description).toBe('Chained Description');
      expect(embed.fields).toHaveLength(2);
    });
  });

  describe('edge cases', () => {
    it('should handle overwriting properties', () => {
      const embed = new Embed();
      embed.setTitle('First Title');
      embed.setTitle('Second Title');

      expect(embed.title).toBe('Second Title');
    });

    it('should handle overwriting footer', () => {
      const embed = new Embed();
      embed.setFooter({ text: 'First Footer' });
      embed.setFooter({ text: 'Second Footer' });

      expect(embed.footer?.text).toBe('Second Footer');
    });

    it('should handle overwriting image', () => {
      const embed = new Embed();
      embed.setImage('https://example.com/first.png');
      embed.setImage('https://example.com/second.png');

      expect(embed.image?.url).toBe('https://example.com/second.png');
    });

    it('should handle overwriting thumbnail', () => {
      const embed = new Embed();
      embed.setThumbnail('https://example.com/first.png');
      embed.setThumbnail('https://example.com/second.png');

      expect(embed.thumbnail?.url).toBe('https://example.com/second.png');
    });

    it('should handle empty fields array in toJSON', () => {
      const embed = new Embed();
      const json = embed.toJSON();

      expect(json.fields).toEqual([]);
    });

    it('should handle over maximum title length (257+ characters)', () => {
      const embed = new Embed();
      const overMaxTitle = 'a'.repeat(300);
      embed.setTitle(overMaxTitle);

      expect(embed.title).toBe(overMaxTitle);
      expect(embed.title?.length).toBe(300);
    });

    it('should handle over maximum description length (4097+ characters)', () => {
      const embed = new Embed();
      const overMaxDesc = 'a'.repeat(5000);
      embed.setDescription(overMaxDesc);

      expect(embed.description).toBe(overMaxDesc);
      expect(embed.description?.length).toBe(5000);
    });

    it('should handle negative color values', () => {
      const embed = new Embed();
      embed.setColor(-1);

      expect(embed.color).toBe(-1);
    });

    it('should handle color values above maximum', () => {
      const embed = new Embed();
      embed.setColor(16777216);

      expect(embed.color).toBe(16777216);
    });

    it('should handle invalid URL format', () => {
      const embed = new Embed();
      embed.setURL('not-a-valid-url');

      expect(embed.url).toBe('not-a-valid-url');
    });

    it('should handle empty string URL', () => {
      const embed = new Embed();
      embed.setURL('');

      expect(embed.url).toBe('');
    });

    it('should handle malformed author URLs', () => {
      const embed = new Embed();
      embed.setAuthor({
        name: 'Test Author',
        url: 'not-a-valid-url',
        icon_url: 'also-not-valid',
      });

      expect(embed.author?.url).toBe('not-a-valid-url');
      expect(embed.author?.icon_url).toBe('also-not-valid');
    });

    it('should handle empty string author name', () => {
      const embed = new Embed();
      embed.setAuthor({ name: '' });

      expect(embed.author?.name).toBe('');
    });

    it('should handle over maximum author name length (257+ characters)', () => {
      const embed = new Embed();
      const overMaxName = 'a'.repeat(300);
      embed.setAuthor({ name: overMaxName });

      expect(embed.author?.name).toBe(overMaxName);
      expect(embed.author?.name.length).toBe(300);
    });

    it('should handle adding more than 25 fields', () => {
      const embed = new Embed();
      const fields = Array.from(
        { length: 30 },
        (_, i) => new Field(`Name ${i + 1}`, `Value ${i + 1}`)
      );

      embed.addFields(fields);

      expect(embed.fields).toHaveLength(30);
    });

    it('should handle null-like values gracefully', () => {
      const embed = new Embed();
      embed.setTitle('Title');
      embed.setDescription('Description');

      const json = embed.toJSON();

      expect(json.title).toBe('Title');
      expect(json.author).toBeUndefined();
      expect(json.footer).toBeUndefined();
    });

    it('should handle very large timestamp dates', () => {
      const embed = new Embed();
      const futureDate = new Date('2099-12-31T23:59:59.999Z');
      embed.setTimestamp(futureDate);

      expect(embed.timestamp).toBe('2099-12-31T23:59:59.999Z');
    });

    it('should handle very old timestamp dates', () => {
      const embed = new Embed();
      const pastDate = new Date('1970-01-01T00:00:00.000Z');
      embed.setTimestamp(pastDate);

      expect(embed.timestamp).toBe('1970-01-01T00:00:00.000Z');
    });

    it('should create independent JSON objects on multiple toJSON calls', () => {
      const embed = new Embed();
      embed.setTitle('Test');
      embed.addField(new Field('Name', 'Value'));

      const json1 = embed.toJSON();
      const json2 = embed.toJSON();

      expect(json1).not.toBe(json2);
      expect(json1.fields).not.toBe(json2.fields);

      json1.title = 'Modified';
      expect(json2.title).toBe('Test');
    });

    it('should handle unicode characters in all text fields', () => {
      const embed = new Embed();
      embed.setTitle('Test 😊 Title');
      embed.setDescription('Description with 🎉 emojis');
      embed.setAuthor({ name: 'Author 中文' });

      expect(embed.title).toBe('Test 😊 Title');
      expect(embed.description).toBe('Description with 🎉 emojis');
      expect(embed.author?.name).toBe('Author 中文');
    });

    it('should handle markdown in description', () => {
      const embed = new Embed();
      const markdown = '**Bold** *Italic* ~~Strike~~ `Code` [Link](url)';
      embed.setDescription(markdown);

      expect(embed.description).toBe(markdown);
    });

    it('should handle newlines and special whitespace', () => {
      const embed = new Embed();
      embed.setTitle('Title\nWith\nNewlines');
      embed.setDescription('Description\t\twith\t\ttabs');

      expect(embed.title).toBe('Title\nWith\nNewlines');
      expect(embed.description).toBe('Description\t\twith\t\ttabs');
    });

    it('should handle setting all color constant values', () => {
      const embed = new Embed();

      embed.setColor(DISCORD_COLORS.INFO);
      expect(embed.color).toBe(DISCORD_COLORS.INFO);

      embed.setColor(DISCORD_COLORS.SUCCESS);
      expect(embed.color).toBe(DISCORD_COLORS.SUCCESS);

      embed.setColor(DISCORD_COLORS.WARNING);
      expect(embed.color).toBe(DISCORD_COLORS.WARNING);

      embed.setColor(DISCORD_COLORS.ERROR);
      expect(embed.color).toBe(DISCORD_COLORS.ERROR);
    });

    it('should handle data URIs for image and thumbnail', () => {
      const embed = new Embed();
      const dataUri = 'data:image/png;base64,iVBORw0KGgo=';
      embed.setImage(dataUri);
      embed.setThumbnail(dataUri);

      expect(embed.image?.url).toBe(dataUri);
      expect(embed.thumbnail?.url).toBe(dataUri);
    });

    it('should handle attachment URLs for images', () => {
      const embed = new Embed();
      embed.setImage('attachment://file.png');
      embed.setThumbnail('attachment://thumb.png');

      expect(embed.image?.url).toBe('attachment://file.png');
      expect(embed.thumbnail?.url).toBe('attachment://thumb.png');
    });
  });
});
