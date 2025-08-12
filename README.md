# Discord Webhook Library

A powerful and easy-to-use library for creating and sending richly formatted messages to Discord webhooks.

This library simplifies the process of constructing the JSON payload for Discord webhooks, providing a clean and intuitive interface for all supported features. It is designed to mirror the structure and capabilities of tools like [Discohook](https://discohook.org/), allowing you to build complex messages with ease.

## Features

- **Flexible Message Creation:** Construct messages using a fluent builder pattern or by passing an options object to the `Message` constructor.
- **User Identity:** Customize the message's `username` and `avatar_url` directly on the `Message` object.
- **Rich Content:** Send plain `content` messages.
- **Embeds:** Create detailed and beautiful embeds with support for:
  - `title`
  - `description`
  - `color`
  - `author` (now accepts a plain object `{ name, url?, icon_url? }`)
  - `fields`
  - `thumbnail` (now accepts a string URL)
  - `image` (now accepts a string URL)
  - `footer` (now accepts a plain object `{ text, icon_url? }`)
  - `timestamp`
- **Thread Support:** Specify `thread_name` for messages in Discord Forum Channels.
- **Message Flags:** Set `flags` for advanced message properties.
- **Batch Sending:** Queue multiple messages and send them in a single operation.
- **Payload Inspection:** Easily view the generated JSON payload before sending.
- **Message Editing & Deletion:** Edit and delete previously sent messages.
- **Text-to-Speech:** Send messages using Discord's `tts` feature.
- **File Attachments:** (Coming Soon) Attach files to your messages.

## Installation

```bash
npm install discord-webhook-library
# or
yarn add discord-webhook-library
# or
bun add discord-webhook-library
```

## Basic Usage

Here is a simple example of how to create and send a webhook message:

```typescript
import { Webhook, Message, Embed, Field } from 'discord-webhook-library';

const hook = new Webhook('YOUR_WEBHOOK_URL');

// --- Example 1: Basic Message ---
const basicMessage = new Message({
  content: 'Hello from the Discord Webhook Library!',
  username: 'My Awesome Bot',
  avatar_url: 'https://i.imgur.com/AfFp7pu.png',
});
hook.addMessage(basicMessage);

// --- Example 2: Message with a Rich Embed ---
const richEmbed = new Embed()
  .setTitle('New Feature Alert!')
  .setDescription('This library just got a major update!')
  .setColor(0x0099ff) // Blue color
  .setTimestamp(new Date())
  .setAuthor({
    name: 'Gemini Dev',
    icon_url: 'https://i.imgur.com/AfFp7pu.png',
  }) // Accepts plain object
  .setFooter({
    text: 'Powered by Gemini',
    icon_url: 'https://i.imgur.com/AfFp7pu.png',
  }) // Accepts plain object
  .setImage('https://i.imgur.com/AfFp7pu.png') // Accepts string URL
  .setThumbnail('https://i.imgur.com/AfFp7pu.png') // Accepts string URL
  .addField(new Field('Version', '1.0.0', true))
  .addField(new Field('Status', 'Stable', true));

const embedMessage = new Message({
  content: 'Check out this cool embed!',
  embeds: [richEmbed],
  thread_name: 'new-features-discussion', // For forum channels
  flags: 0, // No specific flags
});
hook.addMessage(embedMessage);

// --- Example 3: Batch Sending ---
const batchMessage1 = new Message({
  content: 'This is the first message in a batch.',
});
const batchMessage2 = new Message({
  content: 'This is the second message in a batch.',
});
hook.addMessage(batchMessage1);
hook.addMessage(batchMessage2);

// --- Example 4: Editing an Existing Message ---
// You need the full message link or just the message ID
const MESSAGE_LINK_TO_EDIT =
  'https://discord.com/channels/YOUR_GUILD_ID/YOUR_CHANNEL_ID/YOUR_MESSAGE_ID';
const editedMessage = new Message({
  content: 'This message has been updated!',
  editTarget: MESSAGE_LINK_TO_EDIT,
});
hook.addMessage(editedMessage); // Add to queue for sending

// --- Send all queued messages ---
// Messages are sent sequentially. If one fails, it remains in the queue.
try {
  await hook.send();
  console.log('All queued messages sent successfully!');
} catch (error) {
  console.error('Failed to send some messages:', error);
  console.log('Messages remaining in queue:', hook.getPayloads().length);
}

// --- Inspecting Payloads ---
console.log('\n--- Payloads in queue after send attempt ---');
console.log(JSON.stringify(hook.getPayloads(), null, 2)); // Shows remaining messages

// --- Clearing the queue manually ---
hook.clearMessages();
console.log('Queue cleared. Messages in queue:', hook.getPayloads().length);
```
