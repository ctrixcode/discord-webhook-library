# 🚀 Discord Webhook Library

A powerful, modern Node.js library for creating and sending richly formatted messages to Discord webhooks.

---

## 📝 Overview

Discord Webhook Library makes it easy to construct and send complex Discord webhook messages, including embeds, files, and advanced features. Its intuitive API lets you build messages using a fluent builder or simple options objects, with robust validation and error handling.

---

## 🆕 What's New in 0.9.2

- **Multi-webhook support:** Send messages to multiple webhooks in one go.

---

## ✨ Features

- **Custom Error Classes:** (`WebhookError`, `ValidationError`, `RequestError`, `FileSystemError`) for clear, actionable errors.
- **Flexible Message Creation:** Use a builder pattern or options object.
- **User Identity:** Set `username` and `avatar_url` per message.
- **Rich Content:** Send plain text, embeds, and files.
- **Embeds:** Full support for all Discord embed fields:
  - `title`, `description`, `color`, `author`, `fields`, `thumbnail`, `image`, `footer`, `timestamp`
- **Zod Validation:** Ensures payloads meet Discord API limits.
- **Axios-based HTTP Client:** Reliable requests with built-in rate-limiting.
- **File Attachments:** Send files with or without messages.
- **Pre-styled Helper Embeds:** Quickly send info, success, warning, and error messages.
- **Thread Support:** Specify `thread_name` for forum channels.
- **Message Flags:** Set advanced message properties.
- **Batch Sending:** Queue and send multiple messages at once.
- **Payload Inspection:** View generated JSON before sending.
- **Edit & Delete Messages:** Update or remove sent messages.
- **Text-to-Speech:** Use Discord’s `tts` feature.
- **Expanded Test Coverage:** Comprehensive tests for all scenarios.

---

## 📦 Installation

```bash
pnpm add discord-webhook-library axios form-data
# or
npm install discord-webhook-library axios form-data
# or
yarn add discord-webhook-library axios form-data
```

---

## 🏁 Quickstart

```typescript
import { Webhook, Message, Embed, Field } from 'discord-webhook-library';

const hook = new Webhook('YOUR_WEBHOOK_URL');

// Basic message
hook.addMessage(new Message({
  content: 'Hello from the Discord Webhook Library!',
  username: 'My Bot',
  avatar_url: 'https://i.imgur.com/AfFp7pu.png',
}));

// Rich embed
const embed = new Embed()
  .setTitle('New Feature!')
  .setDescription('Major update released!')
  .setColor(0x0099ff)
  .setTimestamp(new Date())
  .setAuthor({ name: 'Gemini Dev', icon_url: 'https://i.imgur.com/AfFp7pu.png' })
  .setFooter({ text: 'Powered by Gemini', icon_url: 'https://i.imgur.com/AfFp7pu.png' })
  .setImage('https://i.imgur.com/AfFp7pu.png')
  .setThumbnail('https://i.imgur.com/AfFp7pu.png')
  .addField(new Field('Version', '0.9.0', true))
  .addField(new Field('Status', 'Stable', true));

hook.addMessage(new Message({
  content: 'Check out this cool embed!',
  embeds: [embed],
}));

// Send all queued messages
await hook.send();
```

---

## 🧑‍💻 Advanced Usage

### Send a File

```typescript
await hook.sendFile('./my_file.txt');
```

### Send a File with a Message

```typescript
const fileMsg = new Message({ content: 'Here is a file with a message!' });
await hook.sendFile('./my_file.txt', fileMsg);
```

### Pre-styled Helper Embeds

```typescript
await hook.info('System Update', 'Server restarts in 5 minutes.');
await hook.success('Deployment Successful!');
await hook.warning('Low Disk Space', 'Only 10% left.');
await hook.error('Critical Error', 'DB connection failed.');
```

### Message with Only an Embed

```typescript
const embedOnlyMsg = new Message({
  embeds: [
    new Embed()
      .setTitle('Embed Only Message')
      .setDescription('This message has no content, only an embed.')
      .setColor(0xffa500),
  ],
});
hook.addMessage(embedOnlyMsg);
```

### Batch Sending

```typescript
hook.addMessage(new Message({ content: 'First batch message.' }));
hook.addMessage(new Message({ content: 'Second batch message.' }));
await hook.send();
```

### Edit an Existing Message

```typescript
const MESSAGE_LINK_TO_EDIT = 'https://discord.com/channels/YOUR_GUILD_ID/YOUR_CHANNEL_ID/YOUR_MESSAGE_ID';
const editedMsg = new Message({
  content: 'This message has been updated!',
  editTarget: MESSAGE_LINK_TO_EDIT,
});
hook.addMessage(editedMsg);
await hook.send();
```

### Delete an Existing Message

```typescript
await hook.delete('YOUR_MESSAGE_ID');
```

### Inspect Payloads

```typescript
console.log(hook.getPayloads());
```

### Clear the Queue

```typescript
hook.clearMessages();
console.log('Queue cleared. Messages in queue:', hook.getPayloads().length);
```

---

## 🛡️ Browser Compatibility & Backend Proxy

> **Node.js only!**  
> Direct browser use is not recommended due to CORS and security risks.  
> Use this library on your backend server as a proxy.

- **CORS:** Browsers block direct requests to Discord’s API.
- **Security:** Never expose your webhook URL in client-side code.

For browser apps, send requests to your backend, which uses this library to send messages to Discord.

---

## 🛠️ Development & Contributing

This project uses [Husky](https://typicode.github.io/husky/) for Git hooks:

- **`pre-commit` hook:** Runs `eslint` and `prettier` on staged files.
- **`pre-push` hook:** Auto-bumps patch version on `main` branch.

> ⚠️ Every push to `main` creates a new version commit and tag.  
> For production, consider a dedicated release pipeline.

---

## 📚 Resources

- [Discord Webhook Docs](https://discord.com/developers/docs/resources/webhook)
- [Gemini Dev](https://github.com/vanshkabra)

---

## 📝 License

MIT
