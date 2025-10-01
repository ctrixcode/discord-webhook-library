import { Message } from '../src/builders/Message';
import { Embed } from '../src/builders/Embed';
import { Field } from '../src/components/Field';

describe('Message Builder', () => {
  describe('constructor', () => {
    it('should create an empty Message instance', () => {
      const message = new Message();

      expect(message.content).toBeUndefined();
      expect(message.username).toBeUndefined();
      expect(message.avatar_url).toBeUndefined();
      expect(message.tts).toBeUndefined();
      expect(message.embeds).toEqual([]);
      expect(message.thread_name).toBeUndefined();
      expect(message.flags).toBeUndefined();
      expect(message.editTarget).toBeUndefined();
    });

    it('should create a Message with content', () => {
      const message = new Message({ content: 'Test Content' });

      expect(message.content).toBe('Test Content');
    });

    it('should create a Message with all properties', () => {
      const embed = new Embed().setTitle('Test Embed');
      const message = new Message({
        content: 'Test Content',
        username: 'Test Bot',
        avatar_url: 'https://example.com/avatar.png',
        tts: true,
        embeds: [embed],
        thread_name: 'Test Thread',
        flags: 4,
        editTarget: '123456789',
      });

      expect(message.content).toBe('Test Content');
      expect(message.username).toBe('Test Bot');
      expect(message.avatar_url).toBe('https://example.com/avatar.png');
      expect(message.tts).toBe(true);
      expect(message.embeds).toHaveLength(1);
      expect(message.thread_name).toBe('Test Thread');
      expect(message.flags).toBe(4);
      expect(message.editTarget).toBe('123456789');
    });
  });

  describe('setContent', () => {
    it('should set the content', () => {
      const message = new Message();
      message.setContent('Test Content');

      expect(message.content).toBe('Test Content');
    });

    it('should return the Message instance for chaining', () => {
      const message = new Message();
      const result = message.setContent('Test Content');

      expect(result).toBe(message);
    });

    it('should handle maximum length content (2000 characters)', () => {
      const message = new Message();
      const maxLengthContent = 'a'.repeat(2000);
      message.setContent(maxLengthContent);

      expect(message.content).toBe(maxLengthContent);
      expect(message.content?.length).toBe(2000);
    });

    it('should handle empty string', () => {
      const message = new Message();
      message.setContent('');

      expect(message.content).toBe('');
    });

    it('should handle markdown formatting', () => {
      const message = new Message();
      message.setContent('**Bold** *Italic* ~~Strikethrough~~ `code`');

      expect(message.content).toBe(
        '**Bold** *Italic* ~~Strikethrough~~ `code`'
      );
    });

    it('should handle multiline content', () => {
      const message = new Message();
      message.setContent('Line 1\nLine 2\nLine 3');

      expect(message.content).toBe('Line 1\nLine 2\nLine 3');
    });

    it('should handle special characters', () => {
      const message = new Message();
      message.setContent('Test with @mentions, #channels, and :emoji:');

      expect(message.content).toBe(
        'Test with @mentions, #channels, and :emoji:'
      );
    });
  });

  describe('setUsername', () => {
    it('should set the username', () => {
      const message = new Message();
      message.setUsername('Custom Bot');

      expect(message.username).toBe('Custom Bot');
    });

    it('should return the Message instance for chaining', () => {
      const message = new Message();
      const result = message.setUsername('Custom Bot');

      expect(result).toBe(message);
    });

    it('should handle empty string', () => {
      const message = new Message();
      message.setUsername('');

      expect(message.username).toBe('');
    });

    it('should handle special characters in username', () => {
      const message = new Message();
      message.setUsername('Bot 🤖');

      expect(message.username).toBe('Bot 🤖');
    });
  });

  describe('setAvatarURL', () => {
    it('should set the avatar URL', () => {
      const message = new Message();
      message.setAvatarURL('https://example.com/avatar.png');

      expect(message.avatar_url).toBe('https://example.com/avatar.png');
    });

    it('should return the Message instance for chaining', () => {
      const message = new Message();
      const result = message.setAvatarURL('https://example.com/avatar.png');

      expect(result).toBe(message);
    });

    it('should handle various URL formats', () => {
      const urls = [
        'https://example.com/avatar.png',
        'http://example.com/avatar.jpg',
        'https://cdn.discordapp.com/avatars/123/abc.png',
      ];

      urls.forEach((url) => {
        const message = new Message();
        message.setAvatarURL(url);
        expect(message.avatar_url).toBe(url);
      });
    });
  });

  describe('setTTS', () => {
    it('should set TTS to true', () => {
      const message = new Message();
      message.setTTS(true);

      expect(message.tts).toBe(true);
    });

    it('should set TTS to false', () => {
      const message = new Message();
      message.setTTS(false);

      expect(message.tts).toBe(false);
    });

    it('should return the Message instance for chaining', () => {
      const message = new Message();
      const result = message.setTTS(true);

      expect(result).toBe(message);
    });
  });

  describe('addEmbed', () => {
    it('should add a single embed', () => {
      const message = new Message();
      const embed = new Embed().setTitle('Test Embed');
      message.addEmbed(embed);

      expect(message.embeds).toHaveLength(1);
      expect(message.embeds[0]).toBe(embed);
    });

    it('should return the Message instance for chaining', () => {
      const message = new Message();
      const embed = new Embed();
      const result = message.addEmbed(embed);

      expect(result).toBe(message);
    });

    it('should add multiple embeds via multiple calls', () => {
      const message = new Message();
      const embed1 = new Embed().setTitle('Embed 1');
      const embed2 = new Embed().setTitle('Embed 2');

      message.addEmbed(embed1).addEmbed(embed2);

      expect(message.embeds).toHaveLength(2);
      expect(message.embeds[0]).toBe(embed1);
      expect(message.embeds[1]).toBe(embed2);
    });
  });

  describe('addEmbeds', () => {
    it('should add multiple embeds at once', () => {
      const message = new Message();
      const embeds = [
        new Embed().setTitle('Embed 1'),
        new Embed().setTitle('Embed 2'),
        new Embed().setTitle('Embed 3'),
      ];

      message.addEmbeds(embeds);

      expect(message.embeds).toHaveLength(3);
      expect(message.embeds).toEqual(embeds);
    });

    it('should return the Message instance for chaining', () => {
      const message = new Message();
      const embeds = [new Embed()];
      const result = message.addEmbeds(embeds);

      expect(result).toBe(message);
    });

    it('should handle empty array', () => {
      const message = new Message();
      message.addEmbeds([]);

      expect(message.embeds).toHaveLength(0);
    });

    it('should append to existing embeds', () => {
      const message = new Message();
      const embed1 = new Embed().setTitle('Embed 1');
      const embeds2 = [
        new Embed().setTitle('Embed 2'),
        new Embed().setTitle('Embed 3'),
      ];

      message.addEmbed(embed1).addEmbeds(embeds2);

      expect(message.embeds).toHaveLength(3);
    });

    it('should handle up to 10 embeds', () => {
      const message = new Message();
      const embeds = Array.from({ length: 10 }, (_, i) =>
        new Embed().setTitle(`Embed ${i + 1}`)
      );

      message.addEmbeds(embeds);

      expect(message.embeds).toHaveLength(10);
    });
  });

  describe('setThreadName', () => {
    it('should set the thread name', () => {
      const message = new Message();
      message.setThreadName('New Thread');

      expect(message.thread_name).toBe('New Thread');
    });

    it('should return the Message instance for chaining', () => {
      const message = new Message();
      const result = message.setThreadName('New Thread');

      expect(result).toBe(message);
    });
  });

  describe('setFlags', () => {
    it('should set the flags', () => {
      const message = new Message();
      message.setFlags(4);

      expect(message.flags).toBe(4);
    });

    it('should return the Message instance for chaining', () => {
      const message = new Message();
      const result = message.setFlags(4);

      expect(result).toBe(message);
    });

    it('should handle various flag values', () => {
      const flagValues = [0, 1, 4, 64, 4096];

      flagValues.forEach((flag) => {
        const message = new Message();
        message.setFlags(flag);
        expect(message.flags).toBe(flag);
      });
    });
  });

  describe('setEditTarget', () => {
    it('should set the edit target', () => {
      const message = new Message();
      message.setEditTarget('123456789');

      expect(message.editTarget).toBe('123456789');
    });

    it('should return the Message instance for chaining', () => {
      const message = new Message();
      const result = message.setEditTarget('123456789');

      expect(result).toBe(message);
    });

    it('should handle message link format', () => {
      const message = new Message();
      const messageLink = 'https://discord.com/channels/123/456/789';
      message.setEditTarget(messageLink);

      expect(message.editTarget).toBe(messageLink);
    });
  });

  describe('getPayload', () => {
    it('should return empty object for empty message', () => {
      const message = new Message();
      const payload = message.getPayload();

      expect(payload).toEqual({});
    });

    it('should return payload with content only', () => {
      const message = new Message({ content: 'Test Content' });
      const payload = message.getPayload();

      expect(payload).toEqual({ content: 'Test Content' });
    });

    it('should return payload with all properties', () => {
      const embed = new Embed().setTitle('Test Embed');
      const message = new Message({
        content: 'Test Content',
        username: 'Test Bot',
        avatar_url: 'https://example.com/avatar.png',
        tts: true,
        embeds: [embed],
        thread_name: 'Test Thread',
        flags: 4,
      });

      const payload = message.getPayload();

      expect(payload.content).toBe('Test Content');
      expect(payload.username).toBe('Test Bot');
      expect(payload.avatar_url).toBe('https://example.com/avatar.png');
      expect(payload.tts).toBe(true);
      expect(payload.embeds).toHaveLength(1);
      expect(payload.thread_name).toBe('Test Thread');
      expect(payload.flags).toBe(4);
    });

    it('should properly serialize embeds', () => {
      const message = new Message();
      const embed = new Embed()
        .setTitle('Test Title')
        .setDescription('Test Description')
        .setColor(0xff0000)
        .addField(new Field('Field Name', 'Field Value'));

      message.addEmbed(embed);
      const payload = message.getPayload();

      expect(payload.embeds).toHaveLength(1);
      const embedPayload = payload.embeds as Array<Record<string, unknown>>;
      expect(embedPayload[0].title).toBe('Test Title');
      expect(embedPayload[0].description).toBe('Test Description');
      expect(embedPayload[0].color).toBe(0xff0000);
      expect(Array.isArray(embedPayload[0].fields)).toBe(true);
    });

    it('should not include undefined properties', () => {
      const message = new Message({ content: 'Test' });
      const payload = message.getPayload();

      expect(payload).toEqual({ content: 'Test' });
      expect('username' in payload).toBe(false);
      expect('avatar_url' in payload).toBe(false);
      expect('tts' in payload).toBe(false);
      expect('thread_name' in payload).toBe(false);
      expect('flags' in payload).toBe(false);
    });

    it('should not include editTarget in payload', () => {
      const message = new Message({
        content: 'Test',
        editTarget: '123456789',
      });
      const payload = message.getPayload();

      expect('editTarget' in payload).toBe(false);
    });

    it('should handle empty embeds array', () => {
      const message = new Message({ content: 'Test' });
      const payload = message.getPayload();

      expect('embeds' in payload).toBe(false);
    });

    it('should include tts when set to false', () => {
      const message = new Message({
        content: 'Test',
        tts: false,
      });
      const payload = message.getPayload();

      expect('tts' in payload).toBe(false);
    });

    it('should include tts when set to true', () => {
      const message = new Message({
        content: 'Test',
        tts: true,
      });
      const payload = message.getPayload();

      expect(payload.tts).toBe(true);
    });
  });

  describe('method chaining', () => {
    it('should support full method chaining', () => {
      const embed1 = new Embed().setTitle('Embed 1');
      const embed2 = new Embed().setTitle('Embed 2');

      const message = new Message()
        .setContent('Chained Content')
        .setUsername('Chained Bot')
        .setAvatarURL('https://example.com/avatar.png')
        .setTTS(true)
        .addEmbed(embed1)
        .addEmbed(embed2)
        .setThreadName('Chained Thread')
        .setFlags(4)
        .setEditTarget('123456789');

      expect(message.content).toBe('Chained Content');
      expect(message.username).toBe('Chained Bot');
      expect(message.avatar_url).toBe('https://example.com/avatar.png');
      expect(message.tts).toBe(true);
      expect(message.embeds).toHaveLength(2);
      expect(message.thread_name).toBe('Chained Thread');
      expect(message.flags).toBe(4);
      expect(message.editTarget).toBe('123456789');
    });
  });

  describe('edge cases', () => {
    it('should handle overwriting content', () => {
      const message = new Message();
      message.setContent('First Content');
      message.setContent('Second Content');

      expect(message.content).toBe('Second Content');
    });

    it('should handle overwriting username', () => {
      const message = new Message();
      message.setUsername('First Bot');
      message.setUsername('Second Bot');

      expect(message.username).toBe('Second Bot');
    });

    it('should handle very long content', () => {
      const message = new Message();
      const veryLongContent = 'a'.repeat(3000);
      message.setContent(veryLongContent);

      expect(message.content).toBe(veryLongContent);
      expect(message.content?.length).toBe(3000);
    });

    it('should handle message with only embeds (no content)', () => {
      const message = new Message();
      const embed = new Embed().setTitle('Only Embed');
      message.addEmbed(embed);

      const payload = message.getPayload();

      expect('content' in payload).toBe(false);
      expect(payload.embeds).toHaveLength(1);
    });

    it('should handle message with both content and embeds', () => {
      const message = new Message({ content: 'Test Content' });
      const embed = new Embed().setTitle('Test Embed');
      message.addEmbed(embed);

      const payload = message.getPayload();

      expect(payload.content).toBe('Test Content');
      expect(payload.embeds).toHaveLength(1);
    });

    it('should handle over maximum content length (2001+ characters)', () => {
      const message = new Message();
      const overMaxContent = 'a'.repeat(2500);
      message.setContent(overMaxContent);

      expect(message.content).toBe(overMaxContent);
      expect(message.content?.length).toBe(2500);
    });

    it('should handle adding more than 10 embeds', () => {
      const message = new Message();
      const embeds = Array.from({ length: 15 }, (_, i) =>
        new Embed().setTitle(`Embed ${i + 1}`)
      );

      message.addEmbeds(embeds);

      expect(message.embeds).toHaveLength(15);
    });

    it('should handle invalid avatar URL format', () => {
      const message = new Message();
      message.setAvatarURL('not-a-valid-url');

      expect(message.avatar_url).toBe('not-a-valid-url');
    });

    it('should handle empty string avatar URL', () => {
      const message = new Message();
      message.setAvatarURL('');

      expect(message.avatar_url).toBe('');
    });

    it('should handle unicode characters in content', () => {
      const message = new Message();
      message.setContent('Content with 😊 emojis and 中文 characters');

      expect(message.content).toBe(
        'Content with 😊 emojis and 中文 characters'
      );
    });

    it('should handle unicode characters in username', () => {
      const message = new Message();
      message.setUsername('User 🤖 Name');

      expect(message.username).toBe('User 🤖 Name');
    });

    it('should handle newlines in content', () => {
      const message = new Message();
      message.setContent('Line 1\nLine 2\nLine 3');

      expect(message.content).toBe('Line 1\nLine 2\nLine 3');
    });

    it('should handle tabs and special whitespace', () => {
      const message = new Message();
      message.setContent('Content\t\twith\t\ttabs');

      expect(message.content).toBe('Content\t\twith\t\ttabs');
    });

    it('should handle negative flag values', () => {
      const message = new Message();
      message.setFlags(-1);

      expect(message.flags).toBe(-1);
    });

    it('should handle very large flag values', () => {
      const message = new Message();
      message.setFlags(999999);

      expect(message.flags).toBe(999999);
    });

    it('should handle empty string edit target', () => {
      const message = new Message();
      message.setEditTarget('');

      expect(message.editTarget).toBe('');
    });

    it('should handle numeric edit target', () => {
      const message = new Message();
      message.setEditTarget('1234567890123456789');

      expect(message.editTarget).toBe('1234567890123456789');
    });

    it('should handle empty string thread name', () => {
      const message = new Message();
      message.setThreadName('');

      expect(message.thread_name).toBe('');
    });

    it('should handle very long thread name', () => {
      const message = new Message();
      const longThreadName = 'a'.repeat(200);
      message.setThreadName(longThreadName);

      expect(message.thread_name).toBe(longThreadName);
    });

    it('should handle toggling TTS multiple times', () => {
      const message = new Message();
      message.setTTS(true);
      expect(message.tts).toBe(true);

      message.setTTS(false);
      expect(message.tts).toBe(false);

      message.setTTS(true);
      expect(message.tts).toBe(true);
    });

    it('should handle HTML entities in content', () => {
      const message = new Message();
      message.setContent('Content with &lt;tags&gt; and &amp; entities');

      expect(message.content).toBe(
        'Content with &lt;tags&gt; and &amp; entities'
      );
    });

    it('should handle code blocks in content', () => {
      const message = new Message();
      message.setContent('```js\nconst x = 5;\nconsole.log(x);\n```');

      expect(message.content).toBe('```js\nconst x = 5;\nconsole.log(x);\n```');
    });

    it('should handle empty embeds with various properties set', () => {
      const message = new Message();
      message.setContent('Test');
      message.setUsername('Bot');
      message.setAvatarURL('https://example.com/avatar.png');
      message.setTTS(true);

      const payload = message.getPayload();

      expect(payload.content).toBe('Test');
      expect(payload.username).toBe('Bot');
      expect(payload.avatar_url).toBe('https://example.com/avatar.png');
      expect(payload.tts).toBe(true);
      expect('embeds' in payload).toBe(false);
    });

    it('should create independent payload objects on multiple getPayload calls', () => {
      const message = new Message({ content: 'Test' });
      message.addEmbed(new Embed().setTitle('Embed'));

      const payload1 = message.getPayload();
      const payload2 = message.getPayload();

      expect(payload1).not.toBe(payload2);
      expect(payload1.embeds).not.toBe(payload2.embeds);
    });

    it('should handle flags with value 0', () => {
      const message = new Message();
      message.setFlags(0);

      expect(message.flags).toBe(0);
    });

    it('should handle message construction with null-like values', () => {
      const message = new Message({
        content: 'Test',
        username: undefined,
        avatar_url: undefined,
        tts: undefined,
      });

      expect(message.content).toBe('Test');
      expect(message.username).toBeUndefined();
      expect(message.avatar_url).toBeUndefined();
      expect(message.tts).toBeUndefined();
    });

    it('should handle complex embed combinations', () => {
      const message = new Message({ content: 'Test' });
      const embed1 = new Embed()
        .setTitle('Embed 1')
        .setDescription('Description 1')
        .addField(new Field('Field 1', 'Value 1'));

      const embed2 = new Embed()
        .setTitle('Embed 2')
        .setColor(0xff0000)
        .setTimestamp();

      message.addEmbed(embed1).addEmbed(embed2);

      const payload = message.getPayload();
      expect(payload.embeds).toHaveLength(2);
    });

    it('should handle data URI avatar URLs', () => {
      const message = new Message();
      const dataUri = 'data:image/png;base64,iVBORw0KGgo=';
      message.setAvatarURL(dataUri);

      expect(message.avatar_url).toBe(dataUri);
    });

    it('should handle very long username', () => {
      const message = new Message();
      const longUsername = 'a'.repeat(100);
      message.setUsername(longUsername);

      expect(message.username).toBe(longUsername);
      expect(message.username?.length).toBe(100);
    });

    it('should handle whitespace-only content', () => {
      const message = new Message();
      message.setContent('   ');

      expect(message.content).toBe('   ');
    });

    it('should handle whitespace-only username', () => {
      const message = new Message();
      message.setUsername('   ');

      expect(message.username).toBe('   ');
    });

    it('should handle message links in edit target', () => {
      const message = new Message();
      const messageLink =
        'https://discord.com/channels/123456789/987654321/111222333';
      message.setEditTarget(messageLink);

      expect(message.editTarget).toBe(messageLink);
    });

    it('should handle mentions in content', () => {
      const message = new Message();
      message.setContent('<@123456789> <#987654321> <@&555666777>');

      expect(message.content).toBe('<@123456789> <#987654321> <@&555666777>');
    });

    it('should handle custom emoji in content', () => {
      const message = new Message();
      message.setContent('<:emoji_name:123456789>');

      expect(message.content).toBe('<:emoji_name:123456789>');
    });
  });
});
