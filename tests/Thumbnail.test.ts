import { Thumbnail } from '../src/components/Thumbnail';

describe('Thumbnail Component', () => {
  describe('constructor', () => {
    it('should create a Thumbnail with a valid URL', () => {
      const thumbnail = new Thumbnail('https://example.com/thumb.png');

      expect(thumbnail.url).toBe('https://example.com/thumb.png');
    });

    it('should handle HTTP URLs', () => {
      const thumbnail = new Thumbnail('http://example.com/thumb.png');

      expect(thumbnail.url).toBe('http://example.com/thumb.png');
    });

    it('should handle HTTPS URLs', () => {
      const thumbnail = new Thumbnail('https://example.com/thumb.png');

      expect(thumbnail.url).toBe('https://example.com/thumb.png');
    });

    it('should handle URLs with subdomains', () => {
      const thumbnail = new Thumbnail(
        'https://cdn.example.com/thumbnails/photo.png'
      );

      expect(thumbnail.url).toBe(
        'https://cdn.example.com/thumbnails/photo.png'
      );
    });

    it('should handle URLs with query parameters', () => {
      const thumbnail = new Thumbnail(
        'https://example.com/thumb.png?size=small&format=webp'
      );

      expect(thumbnail.url).toBe(
        'https://example.com/thumb.png?size=small&format=webp'
      );
    });

    it('should handle URLs with fragments', () => {
      const thumbnail = new Thumbnail('https://example.com/thumb.png#preview');

      expect(thumbnail.url).toBe('https://example.com/thumb.png#preview');
    });

    it('should handle URLs with ports', () => {
      const thumbnail = new Thumbnail('https://example.com:8080/thumb.png');

      expect(thumbnail.url).toBe('https://example.com:8080/thumb.png');
    });

    it('should handle various image formats', () => {
      const formats = [
        'https://example.com/thumb.png',
        'https://example.com/thumb.jpg',
        'https://example.com/thumb.jpeg',
        'https://example.com/thumb.gif',
        'https://example.com/thumb.webp',
        'https://example.com/thumb.bmp',
      ];

      formats.forEach((url) => {
        const thumbnail = new Thumbnail(url);
        expect(thumbnail.url).toBe(url);
      });
    });

    describe('edge cases', () => {
      it('should handle very long URLs', () => {
        const longUrl =
          'https://example.com/' + 'a'.repeat(500) + '/thumbnail.png';
        const thumbnail = new Thumbnail(longUrl);

        expect(thumbnail.url).toBe(longUrl);
      });

      it('should handle URLs with query parameters', () => {
        const thumbnail = new Thumbnail(
          'https://example.com/thumb.png?size=small&format=webp'
        );

        expect(thumbnail.url).toBe(
          'https://example.com/thumb.png?size=small&format=webp'
        );
      });

      it('should handle URLs with fragments', () => {
        const thumbnail = new Thumbnail(
          'https://example.com/thumb.png#preview'
        );

        expect(thumbnail.url).toBe('https://example.com/thumb.png#preview');
      });

      it('should handle URLs with authentication', () => {
        const thumbnail = new Thumbnail(
          'https://user:pass@example.com/thumb.png'
        );

        expect(thumbnail.url).toBe('https://user:pass@example.com/thumb.png');
      });

      it('should handle Discord CDN thumbnail URLs', () => {
        const thumbnail = new Thumbnail(
          'https://media.discordapp.net/attachments/123/456/thumb.png'
        );

        expect(thumbnail.url).toBe(
          'https://media.discordapp.net/attachments/123/456/thumb.png'
        );
      });

      it('should handle S3-style thumbnail URLs', () => {
        const thumbnail = new Thumbnail(
          'https://s3.amazonaws.com/bucket/thumbnails/thumb.png'
        );

        expect(thumbnail.url).toBe(
          'https://s3.amazonaws.com/bucket/thumbnails/thumb.png'
        );
      });

      it('should handle file protocol URLs', () => {
        const thumbnail = new Thumbnail('file:///path/to/thumbnail.png');

        expect(thumbnail.url).toBe('file:///path/to/thumbnail.png');
      });

      it('should handle animated thumbnail formats', () => {
        const formats = ['gif', 'apng', 'webp'];

        formats.forEach((format) => {
          const thumbnail = new Thumbnail(
            `https://example.com/thumb.${format}`
          );
          expect(thumbnail.url).toBe(`https://example.com/thumb.${format}`);
        });
      });

      it('should handle SVG thumbnails', () => {
        const thumbnail = new Thumbnail('https://example.com/thumb.svg');

        expect(thumbnail.url).toBe('https://example.com/thumb.svg');
      });

      it('should handle URLs with multiple extensions', () => {
        const thumbnail = new Thumbnail('https://example.com/thumb.backup.png');

        expect(thumbnail.url).toBe('https://example.com/thumb.backup.png');
      });

      it('should handle URLs with unicode domains', () => {
        const thumbnail = new Thumbnail('https://例え.jp/thumb.png');

        expect(thumbnail.url).toBe('https://例え.jp/thumb.png');
      });

      it('should handle CDN proxy URLs', () => {
        const thumbnail = new Thumbnail(
          'https://imageproxy.example.com/thumb?url=test.png'
        );

        expect(thumbnail.url).toBe(
          'https://imageproxy.example.com/thumb?url=test.png'
        );
      });

      it('should maintain independence between toJSON calls', () => {
        const thumbnail = new Thumbnail('https://example.com/thumb.png');
        const json1 = thumbnail.toJSON();
        const json2 = thumbnail.toJSON();

        json1.url = 'https://modified.com/thumb.png';
        expect(json2.url).toBe('https://example.com/thumb.png');
      });
    });

    it('should store any string as URL without validation', () => {
      const thumbnail = new Thumbnail('not-a-valid-url');

      expect(thumbnail.url).toBe('not-a-valid-url');
    });

    it('should handle empty string', () => {
      const thumbnail = new Thumbnail('');

      expect(thumbnail.url).toBe('');
    });

    it('should handle URLs with special characters', () => {
      const thumbnail = new Thumbnail(
        'https://example.com/thumb%20with%20spaces.png'
      );

      expect(thumbnail.url).toBe(
        'https://example.com/thumb%20with%20spaces.png'
      );
    });
  });

  describe('toJSON', () => {
    it('should return correct JSON structure', () => {
      const thumbnail = new Thumbnail('https://example.com/thumb.png');
      const json = thumbnail.toJSON();

      expect(json).toEqual({
        url: 'https://example.com/thumb.png',
      });
    });

    it('should return JSON with any URL value', () => {
      const testUrls = [
        'https://example.com/thumb.png',
        'http://example.com/thumb.jpg',
        'not-a-url',
        '',
        'https://cdn.example.com/path/to/thumb.gif?v=1',
      ];

      testUrls.forEach((url) => {
        const thumbnail = new Thumbnail(url);
        const json = thumbnail.toJSON();

        expect(json).toEqual({ url });
      });
    });

    it('should create independent JSON objects', () => {
      const thumbnail = new Thumbnail('https://example.com/thumb.png');
      const json1 = thumbnail.toJSON();
      const json2 = thumbnail.toJSON();

      expect(json1).toEqual(json2);
      expect(json1).not.toBe(json2);

      json1.url = 'https://modified.com/thumb.png';
      expect(json2.url).toBe('https://example.com/thumb.png');
    });

    it('should handle Discord CDN URLs', () => {
      const thumbnail = new Thumbnail(
        'https://cdn.discordapp.com/attachments/123/456/thumb.png'
      );
      const json = thumbnail.toJSON();

      expect(json.url).toBe(
        'https://cdn.discordapp.com/attachments/123/456/thumb.png'
      );
    });

    it('should handle imgur URLs', () => {
      const thumbnail = new Thumbnail('https://i.imgur.com/abc123.png');
      const json = thumbnail.toJSON();

      expect(json.url).toBe('https://i.imgur.com/abc123.png');
    });

    it('should handle data URLs', () => {
      const thumbnail = new Thumbnail(
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      );
      const json = thumbnail.toJSON();

      expect(json.url).toContain('data:image/png;base64');
    });
  });

  describe('edge cases', () => {
    it('should handle URLs with unicode characters', () => {
      const thumbnail = new Thumbnail('https://example.com/缩略图.png');

      expect(thumbnail.url).toBe('https://example.com/缩略图.png');
    });

    it('should handle URLs with encoded characters', () => {
      const thumbnail = new Thumbnail(
        'https://example.com/thumb%20%28copy%29.png'
      );

      expect(thumbnail.url).toBe('https://example.com/thumb%20%28copy%29.png');
    });

    it('should handle localhost URLs', () => {
      const thumbnail = new Thumbnail('http://localhost:3000/thumb.png');

      expect(thumbnail.url).toBe('http://localhost:3000/thumb.png');
    });

    it('should handle IP address URLs', () => {
      const thumbnail = new Thumbnail('http://192.168.1.1/thumb.png');

      expect(thumbnail.url).toBe('http://192.168.1.1/thumb.png');
    });

    it('should handle relative-like URLs', () => {
      const thumbnail = new Thumbnail('/path/to/thumb.png');

      expect(thumbnail.url).toBe('/path/to/thumb.png');
    });

    it('should handle attachment URLs', () => {
      const thumbnail = new Thumbnail('attachment://filename.png');

      expect(thumbnail.url).toBe('attachment://filename.png');
    });
  });
});
