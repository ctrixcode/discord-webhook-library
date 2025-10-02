import { Footer } from '../src/components/Footer';

describe('Footer Component', () => {
  describe('constructor', () => {
    it('should create a Footer with required text property', () => {
      const footer = new Footer('Test Footer Text');

      expect(footer.text).toBe('Test Footer Text');
      expect(footer.icon_url).toBeUndefined();
    });

    it('should create a Footer with text and icon_url', () => {
      const footer = new Footer(
        'Test Footer Text',
        'https://example.com/icon.png'
      );

      expect(footer.text).toBe('Test Footer Text');
      expect(footer.icon_url).toBe('https://example.com/icon.png');
    });

    it('should handle empty string for text', () => {
      const footer = new Footer('');

      expect(footer.text).toBe('');
      expect(footer.icon_url).toBeUndefined();
    });

    it('should handle maximum length text (2048 characters)', () => {
      const maxLengthText = 'a'.repeat(2048);
      const footer = new Footer(maxLengthText);

      expect(footer.text).toBe(maxLengthText);
      expect(footer.text.length).toBe(2048);
    });

    it('should handle over maximum length text', () => {
      const overMaxLengthText = 'a'.repeat(2500);
      const footer = new Footer(overMaxLengthText);

      expect(footer.text).toBe(overMaxLengthText);
      expect(footer.text.length).toBe(2500);
    });

    it('should handle text with special characters', () => {
      const footer = new Footer('Footer with *markdown* and **bold** text');

      expect(footer.text).toBe('Footer with *markdown* and **bold** text');
    });

    it('should handle text with unicode characters', () => {
      const footer = new Footer('Footer with 🎉 emojis and ñ characters');

      expect(footer.text).toBe('Footer with 🎉 emojis and ñ characters');
    });

    it('should handle text with newlines', () => {
      const footer = new Footer('Line 1\nLine 2\nLine 3');

      expect(footer.text).toBe('Line 1\nLine 2\nLine 3');
    });
  });

  describe('toJSON', () => {
    it('should return correct JSON structure with text only', () => {
      const footer = new Footer('Test Footer Text');
      const json = footer.toJSON();

      expect(json).toEqual({
        text: 'Test Footer Text',
        icon_url: undefined,
      });
    });

    it('should return correct JSON structure with text and icon_url', () => {
      const footer = new Footer(
        'Test Footer Text',
        'https://example.com/icon.png'
      );
      const json = footer.toJSON();

      expect(json).toEqual({
        text: 'Test Footer Text',
        icon_url: 'https://example.com/icon.png',
      });
    });

    it('should handle various valid URL formats for icon_url', () => {
      const testUrls = [
        'https://example.com/icon.png',
        'http://example.com/icon.jpg',
        'https://cdn.example.com/path/to/icon.gif',
        'https://example.com/icon.webp?size=128',
      ];

      testUrls.forEach((url) => {
        const footer = new Footer('Test', url);
        const json = footer.toJSON();

        expect(json.icon_url).toBe(url);
      });
    });

    it('should handle special characters in text', () => {
      const footer = new Footer('Footer with *special* characters & symbols');
      const json = footer.toJSON();

      expect(json.text).toBe('Footer with *special* characters & symbols');
    });

    it('should handle HTML entities', () => {
      const footer = new Footer('Footer &lt;text&gt; with &amp; entities');
      const json = footer.toJSON();

      expect(json.text).toBe('Footer &lt;text&gt; with &amp; entities');
    });

    it('should create independent JSON objects', () => {
      const footer = new Footer('Test Footer', 'https://example.com/icon.png');
      const json1 = footer.toJSON();
      const json2 = footer.toJSON();

      expect(json1).toEqual(json2);
      expect(json1).not.toBe(json2);

      json1.text = 'Modified';
      expect(json2.text).toBe('Test Footer');
    });

    it('should handle empty icon_url string', () => {
      const footer = new Footer('Test Footer', '');
      const json = footer.toJSON();

      expect(json.icon_url).toBe('');
    });

    it('should handle whitespace-only text', () => {
      const footer = new Footer('   ');
      const json = footer.toJSON();

      expect(json.text).toBe('   ');
    });
  });

  describe('edge cases', () => {
    it('should handle very long icon URLs', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(500) + '.png';
      const footer = new Footer('Test', longUrl);

      expect(footer.icon_url).toBe(longUrl);
    });

    it('should handle URLs with query parameters', () => {
      const footer = new Footer(
        'Test',
        'https://example.com/icon.png?v=1&size=large'
      );

      expect(footer.icon_url).toBe(
        'https://example.com/icon.png?v=1&size=large'
      );
    });

    it('should handle URLs with fragments', () => {
      const footer = new Footer('Test', 'https://example.com/icon.png#section');

      expect(footer.icon_url).toBe('https://example.com/icon.png#section');
    });

    it('should handle numeric strings', () => {
      const footer = new Footer('12345', 'https://example.com/icon.png');

      expect(footer.text).toBe('12345');
    });

    it('should handle text with tabs and multiple spaces', () => {
      const footer = new Footer('Text\t\twith\t\ttabs   and   spaces');

      expect(footer.text).toBe('Text\t\twith\t\ttabs   and   spaces');
    });

    it('should handle Discord CDN URLs', () => {
      const footer = new Footer(
        'Test',
        'https://cdn.discordapp.com/icons/123/abc.png'
      );

      expect(footer.icon_url).toBe(
        'https://cdn.discordapp.com/icons/123/abc.png'
      );
    });

    it('should handle data URI icons', () => {
      const dataUri = 'data:image/png;base64,iVBORw0KGgo=';
      const footer = new Footer('Test', dataUri);

      expect(footer.icon_url).toBe(dataUri);
    });

    it('should handle attachment protocol', () => {
      const footer = new Footer('Test', 'attachment://icon.png');

      expect(footer.icon_url).toBe('attachment://icon.png');
    });

    it('should handle code formatting in text', () => {
      const footer = new Footer('Footer with `code` formatting');

      expect(footer.text).toBe('Footer with `code` formatting');
    });

    it('should handle markdown links in text', () => {
      const footer = new Footer('Check [documentation](https://example.com)');

      expect(footer.text).toContain('[documentation]');
    });

    it('should handle Discord timestamp in text', () => {
      const footer = new Footer('Updated <t:1234567890:R>');

      expect(footer.text).toBe('Updated <t:1234567890:R>');
    });

    it('should handle zero-width spaces', () => {
      const footer = new Footer('Text\u200Bwith\u200Bzero-width');

      expect(footer.text).toContain('\u200B');
    });

    it('should handle various image formats in icon URL', () => {
      const formats = ['png', 'jpg', 'jpeg', 'gif', 'webp'];

      formats.forEach((format) => {
        const footer = new Footer('Test', `https://example.com/icon.${format}`);
        expect(footer.icon_url).toBe(`https://example.com/icon.${format}`);
      });
    });

    it('should handle malformed URLs gracefully', () => {
      const footer = new Footer('Test', 'not-a-url');

      expect(footer.icon_url).toBe('not-a-url');
    });

    it('should maintain independence between toJSON calls', () => {
      const footer = new Footer('Test', 'https://example.com/icon.png');
      const json1 = footer.toJSON();
      const json2 = footer.toJSON();

      json1.text = 'Modified';
      expect(json2.text).toBe('Test');
    });
  });
});
