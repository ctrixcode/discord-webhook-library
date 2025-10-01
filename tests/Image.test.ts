import { Image } from '../src/components/Image';

describe('Image Component', () => {
  describe('constructor', () => {
    it('should create an Image with a valid URL', () => {
      const image = new Image('https://example.com/image.png');

      expect(image.url).toBe('https://example.com/image.png');
    });

    it('should handle HTTP URLs', () => {
      const image = new Image('http://example.com/image.png');

      expect(image.url).toBe('http://example.com/image.png');
    });

    it('should handle HTTPS URLs', () => {
      const image = new Image('https://example.com/image.png');

      expect(image.url).toBe('https://example.com/image.png');
    });

    it('should handle URLs with subdomains', () => {
      const image = new Image('https://cdn.example.com/images/photo.png');

      expect(image.url).toBe('https://cdn.example.com/images/photo.png');
    });

    it('should handle URLs with query parameters', () => {
      const image = new Image(
        'https://example.com/image.png?size=large&format=webp'
      );

      expect(image.url).toBe(
        'https://example.com/image.png?size=large&format=webp'
      );
    });

    it('should handle URLs with fragments', () => {
      const image = new Image('https://example.com/image.png#main');

      expect(image.url).toBe('https://example.com/image.png#main');
    });

    it('should handle URLs with ports', () => {
      const image = new Image('https://example.com:8080/image.png');

      expect(image.url).toBe('https://example.com:8080/image.png');
    });

    it('should handle various image formats', () => {
      const formats = [
        'https://example.com/image.png',
        'https://example.com/image.jpg',
        'https://example.com/image.jpeg',
        'https://example.com/image.gif',
        'https://example.com/image.webp',
        'https://example.com/image.bmp',
      ];

      formats.forEach((url) => {
        const image = new Image(url);
        expect(image.url).toBe(url);
      });
    });

    describe('edge cases', () => {
      it('should handle very long URLs', () => {
        const longUrl = 'https://example.com/' + 'a'.repeat(500) + '/image.png';
        const image = new Image(longUrl);

        expect(image.url).toBe(longUrl);
      });

      it('should handle URLs with query parameters', () => {
        const image = new Image(
          'https://example.com/image.png?width=800&height=600'
        );

        expect(image.url).toBe(
          'https://example.com/image.png?width=800&height=600'
        );
      });

      it('should handle URLs with fragments', () => {
        const image = new Image('https://example.com/image.png#main');

        expect(image.url).toBe('https://example.com/image.png#main');
      });

      it('should handle URLs with authentication', () => {
        const image = new Image('https://user:pass@example.com/image.png');

        expect(image.url).toBe('https://user:pass@example.com/image.png');
      });

      it('should handle Discord CDN URLs', () => {
        const image = new Image(
          'https://cdn.discordapp.com/attachments/123/456/image.png'
        );

        expect(image.url).toBe(
          'https://cdn.discordapp.com/attachments/123/456/image.png'
        );
      });

      it('should handle S3-style URLs', () => {
        const image = new Image('https://s3.amazonaws.com/bucket/image.png');

        expect(image.url).toBe('https://s3.amazonaws.com/bucket/image.png');
      });

      it('should handle file protocol URLs', () => {
        const image = new Image('file:///path/to/image.png');

        expect(image.url).toBe('file:///path/to/image.png');
      });

      it('should handle animated image formats', () => {
        const formats = ['gif', 'apng', 'webp'];

        formats.forEach((format) => {
          const image = new Image(`https://example.com/animation.${format}`);
          expect(image.url).toBe(`https://example.com/animation.${format}`);
        });
      });

      it('should handle SVG images', () => {
        const image = new Image('https://example.com/vector.svg');

        expect(image.url).toBe('https://example.com/vector.svg');
      });

      it('should handle URLs with multiple extensions', () => {
        const image = new Image('https://example.com/image.backup.png');

        expect(image.url).toBe('https://example.com/image.backup.png');
      });

      it('should handle URLs with unicode domains', () => {
        const image = new Image('https://例え.jp/image.png');

        expect(image.url).toBe('https://例え.jp/image.png');
      });

      it('should handle proxy URLs', () => {
        const image = new Image(
          'https://images.weserv.nl/?url=example.com/image.png'
        );

        expect(image.url).toBe(
          'https://images.weserv.nl/?url=example.com/image.png'
        );
      });

      it('should maintain independence between toJSON calls', () => {
        const image = new Image('https://example.com/image.png');
        const json1 = image.toJSON();
        const json2 = image.toJSON();

        json1.url = 'https://modified.com/image.png';
        expect(json2.url).toBe('https://example.com/image.png');
      });
    });

    it('should store any string as URL without validation', () => {
      const image = new Image('not-a-valid-url');

      expect(image.url).toBe('not-a-valid-url');
    });

    it('should handle empty string', () => {
      const image = new Image('');

      expect(image.url).toBe('');
    });

    it('should handle URLs with special characters', () => {
      const image = new Image('https://example.com/image%20with%20spaces.png');

      expect(image.url).toBe('https://example.com/image%20with%20spaces.png');
    });
  });

  describe('toJSON', () => {
    it('should return correct JSON structure', () => {
      const image = new Image('https://example.com/image.png');
      const json = image.toJSON();

      expect(json).toEqual({
        url: 'https://example.com/image.png',
      });
    });

    it('should return JSON with any URL value', () => {
      const testUrls = [
        'https://example.com/image.png',
        'http://example.com/image.jpg',
        'not-a-url',
        '',
        'https://cdn.example.com/path/to/image.gif?v=1',
      ];

      testUrls.forEach((url) => {
        const image = new Image(url);
        const json = image.toJSON();

        expect(json).toEqual({ url });
      });
    });

    it('should create independent JSON objects', () => {
      const image = new Image('https://example.com/image.png');
      const json1 = image.toJSON();
      const json2 = image.toJSON();

      expect(json1).toEqual(json2);
      expect(json1).not.toBe(json2);

      json1.url = 'https://modified.com/image.png';
      expect(json2.url).toBe('https://example.com/image.png');
    });

    it('should handle Discord CDN URLs', () => {
      const image = new Image(
        'https://cdn.discordapp.com/attachments/123/456/image.png'
      );
      const json = image.toJSON();

      expect(json.url).toBe(
        'https://cdn.discordapp.com/attachments/123/456/image.png'
      );
    });

    it('should handle imgur URLs', () => {
      const image = new Image('https://i.imgur.com/abc123.png');
      const json = image.toJSON();

      expect(json.url).toBe('https://i.imgur.com/abc123.png');
    });

    it('should handle data URLs', () => {
      const image = new Image(
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      );
      const json = image.toJSON();

      expect(json.url).toContain('data:image/png;base64');
    });
  });

  describe('edge cases', () => {
    it('should handle URLs with unicode characters', () => {
      const image = new Image('https://example.com/图片.png');

      expect(image.url).toBe('https://example.com/图片.png');
    });

    it('should handle URLs with encoded characters', () => {
      const image = new Image('https://example.com/image%20%28copy%29.png');

      expect(image.url).toBe('https://example.com/image%20%28copy%29.png');
    });

    it('should handle localhost URLs', () => {
      const image = new Image('http://localhost:3000/image.png');

      expect(image.url).toBe('http://localhost:3000/image.png');
    });

    it('should handle IP address URLs', () => {
      const image = new Image('http://192.168.1.1/image.png');

      expect(image.url).toBe('http://192.168.1.1/image.png');
    });

    it('should handle relative-like URLs', () => {
      const image = new Image('/path/to/image.png');

      expect(image.url).toBe('/path/to/image.png');
    });

    it('should handle attachment URLs', () => {
      const image = new Image('attachment://filename.png');

      expect(image.url).toBe('attachment://filename.png');
    });
  });
});
