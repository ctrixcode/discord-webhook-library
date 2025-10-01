import { Field } from '../src/components/Field';

describe('Field Component', () => {
  describe('constructor', () => {
    it('should create a Field with required properties', () => {
      const field = new Field('Test Name', 'Test Value');

      expect(field.name).toBe('Test Name');
      expect(field.value).toBe('Test Value');
      expect(field.inline).toBeUndefined();
    });

    it('should create a Field with inline property set to true', () => {
      const field = new Field('Test Name', 'Test Value', true);

      expect(field.name).toBe('Test Name');
      expect(field.value).toBe('Test Value');
      expect(field.inline).toBe(true);
    });

    it('should create a Field with inline property set to false', () => {
      const field = new Field('Test Name', 'Test Value', false);

      expect(field.name).toBe('Test Name');
      expect(field.value).toBe('Test Value');
      expect(field.inline).toBe(false);
    });

    it('should handle empty string for name', () => {
      const field = new Field('', 'Test Value');

      expect(field.name).toBe('');
      expect(field.value).toBe('Test Value');
    });

    it('should handle empty string for value', () => {
      const field = new Field('Test Name', '');

      expect(field.name).toBe('Test Name');
      expect(field.value).toBe('');
    });

    it('should handle maximum length name (256 characters)', () => {
      const maxLengthName = 'a'.repeat(256);
      const field = new Field(maxLengthName, 'Test Value');

      expect(field.name).toBe(maxLengthName);
      expect(field.name.length).toBe(256);
    });

    it('should handle maximum length value (1024 characters)', () => {
      const maxLengthValue = 'a'.repeat(1024);
      const field = new Field('Test Name', maxLengthValue);

      expect(field.value).toBe(maxLengthValue);
      expect(field.value.length).toBe(1024);
    });

    it('should handle over maximum length name', () => {
      const overMaxLengthName = 'a'.repeat(300);
      const field = new Field(overMaxLengthName, 'Test Value');

      expect(field.name).toBe(overMaxLengthName);
      expect(field.name.length).toBe(300);
    });

    it('should handle over maximum length value', () => {
      const overMaxLengthValue = 'a'.repeat(1100);
      const field = new Field('Test Name', overMaxLengthValue);

      expect(field.value).toBe(overMaxLengthValue);
      expect(field.value.length).toBe(1100);
    });
  });

  describe('toJSON', () => {
    it('should return correct JSON structure with all properties', () => {
      const field = new Field('Test Name', 'Test Value', true);
      const json = field.toJSON();

      expect(json).toEqual({
        name: 'Test Name',
        value: 'Test Value',
        inline: true,
      });
    });

    it('should return correct JSON structure without inline property', () => {
      const field = new Field('Test Name', 'Test Value');
      const json = field.toJSON();

      expect(json).toEqual({
        name: 'Test Name',
        value: 'Test Value',
        inline: undefined,
      });
    });

    it('should return correct JSON structure with inline set to false', () => {
      const field = new Field('Test Name', 'Test Value', false);
      const json = field.toJSON();

      expect(json).toEqual({
        name: 'Test Name',
        value: 'Test Value',
        inline: false,
      });
    });

    it('should handle special characters in name and value', () => {
      const field = new Field(
        'Test *Name* _with_ **markdown**',
        'Test `Value` with [link](url)'
      );
      const json = field.toJSON();

      expect(json.name).toBe('Test *Name* _with_ **markdown**');
      expect(json.value).toBe('Test `Value` with [link](url)');
    });

    it('should handle unicode characters', () => {
      const field = new Field('Test 😊 Unicode', 'Value 🎉 with emojis');
      const json = field.toJSON();

      expect(json.name).toBe('Test 😊 Unicode');
      expect(json.value).toBe('Value 🎉 with emojis');
    });

    it('should handle newlines and whitespace', () => {
      const field = new Field(
        'Test\nName\nWith\nNewlines',
        'Value\twith\ttabs'
      );
      const json = field.toJSON();

      expect(json.name).toBe('Test\nName\nWith\nNewlines');
      expect(json.value).toBe('Value\twith\ttabs');
    });

    it('should create independent JSON objects', () => {
      const field = new Field('Test Name', 'Test Value', true);
      const json1 = field.toJSON();
      const json2 = field.toJSON();

      expect(json1).toEqual(json2);
      expect(json1).not.toBe(json2);

      json1.name = 'Modified';
      expect(json2.name).toBe('Test Name');
    });
  });

  describe('edge cases', () => {
    it('should handle numeric strings in name and value', () => {
      const field = new Field('123', '456');

      expect(field.name).toBe('123');
      expect(field.value).toBe('456');
    });

    it('should handle fields with only whitespace', () => {
      const field = new Field('   ', '   ');

      expect(field.name).toBe('   ');
      expect(field.value).toBe('   ');
    });

    it('should handle HTML entities', () => {
      const field = new Field('Test &lt;Name&gt;', 'Value &amp; More');

      expect(field.name).toBe('Test &lt;Name&gt;');
      expect(field.value).toBe('Value &amp; More');
    });

    it('should handle code blocks in value', () => {
      const field = new Field('Code Example', '```js\nconst x = 5;\n```');

      expect(field.value).toBe('```js\nconst x = 5;\n```');
    });

    it('should handle markdown links', () => {
      const field = new Field('Links', '[Click here](https://example.com)');

      expect(field.value).toBe('[Click here](https://example.com)');
    });

    it('should handle inline code in name', () => {
      const field = new Field('`Variable` Name', 'Value');

      expect(field.name).toBe('`Variable` Name');
    });

    it('should handle zero-width spaces', () => {
      const field = new Field('Name\u200B', 'Value\u200B');

      expect(field.name).toBe('Name\u200B');
      expect(field.value).toBe('Value\u200B');
    });

    it('should handle Discord mentions in value', () => {
      const field = new Field('User', '<@123456789>');

      expect(field.value).toBe('<@123456789>');
    });

    it('should handle custom emoji', () => {
      const field = new Field('Emoji', '<:custom:123456789>');

      expect(field.value).toBe('<:custom:123456789>');
    });

    it('should handle timestamp formatting', () => {
      const field = new Field('Timestamp', '<t:1234567890:F>');

      expect(field.value).toBe('<t:1234567890:F>');
    });

    it('should maintain independence between toJSON calls', () => {
      const field = new Field('Test', 'Value', true);
      const json1 = field.toJSON();
      const json2 = field.toJSON();

      json1.inline = false;
      expect(json2.inline).toBe(true);
    });

    it('should handle combined markdown formatting', () => {
      const field = new Field(
        '**Bold** *Italic*',
        '~~Strike~~ __Underline__ `Code`'
      );

      expect(field.name).toBe('**Bold** *Italic*');
      expect(field.value).toBe('~~Strike~~ __Underline__ `Code`');
    });

    it('should handle multiline values with code blocks', () => {
      const field = new Field(
        'Code',
        '```python\ndef hello():\n    print("Hello")\n```'
      );

      expect(field.value).toContain('def hello()');
    });

    it('should handle inline being undefined vs false', () => {
      const field1 = new Field('Name', 'Value');
      const field2 = new Field('Name', 'Value', false);

      expect(field1.inline).toBeUndefined();
      expect(field2.inline).toBe(false);
      expect(field1.inline).not.toBe(field2.inline);
    });
  });
});
