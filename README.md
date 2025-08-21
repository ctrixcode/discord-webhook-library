# Discord Webhook Library

A powerful and easy-to-use library for creating and sending richly formatted messages to Discord webhooks.

This library simplifies the process of constructing the JSON payload for Discord webhooks, providing a clean and intuitive interface for all supported features. It is designed to mirror the structure and capabilities of similar tools, allowing you to build complex messages with ease.

## Features

- **Improved Error Handling:** Errors are now thrown as custom classes (`WebhookError`, `ValidationError`, `RequestError`, `FileSystemError`) providing more context and easier programmatic handling.
- **Flexible Message Sending:** Send messages with only embeds (without content), as long as the embeds are valid and contain content.
- **Expanded Test Coverage:** Added more comprehensive tests for various message and embed scenarios.
- **Flexible Message Creation:** Construct messages using a fluent builder pattern or by passing an options object to the `Message` constructor.
- **User Identity:** Customize the message's `username` and `avatar_url` directly on the `Message` object.
- **Rich Content:** Send plain `content` messages.
- **Embeds:** Create detailed and beautiful embeds with support for:
  - `title`
  - `description`
  - `color`
  - `author`
  - `fields`
  - `thumbnail`
  - `image`
  - `footer`
  - `timestamp`
- **Zod Validation:** Robust schema validation for all message and embed payloads, ensuring compliance with Discord API limits.
- **Axios-based HTTP Client:** Reliable and efficient request handling with built-in rate-limiting and error propagation.
- **File Attachments:** Send local files along with your messages.
- **Pre-styled Helper Embeds:** Quickly send `info`, `success`, `warning`, and `error` messages with pre-defined colors.
- **Thread Support:** Specify `thread_name` for messages in Discord Forum Channels.
- **Message Flags:** Set `flags` for advanced message properties.
- **Batch Sending:** Queue multiple messages and send them in a single operation.
- **Payload Inspection:** Easily view the generated JSON payload before sending.
- **Message Editing & Deletion:** Edit and delete previously sent messages.
- **Text-to-Speech:** Send messages using Discord's `tts` feature.

## Installation

```bash
pnpm add discord-webhook-library axios form-data
# or
npm install discord-webhook-library axios form-data
# or
yarn add discord-webhook-library axios form-data
```

## Basic Usage

Here is a simple example of how to create and send webhook messages, including new features:

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
  })
  .setFooter({
    text: 'Powered by Gemini',
    icon_url: 'https://i.imgur.com/AfFp7pu.png',
  })
  .setImage('https://i.imgur.com/AfFp7pu.png')
  .setThumbnail('https://i.imgur.com/AfFp7pu.png')
  .addField(new Field('Version', '0.9.0', true))
  .addField(new Field('Status', 'Stable', true));

const embedMessage = new Message({
  content: 'Check out this cool embed!',
  embeds: [richEmbed],
  thread_name: 'new-features-discussion', // For forum channels
  flags: 0, // No specific flags
});
hook.addMessage(embedMessage);

// --- Example 3: Sending a File ---
// Make sure to have a file named 'my_file.txt' in your project root for this example
// Or replace 'my_file.txt' with the actual path to your file
// await hook.sendFile('./my_file.txt');

// --- Example 4: Sending a File with a Message ---
// const fileWithMessage = new Message({ content: 'Here is a file with a message!' });
// await hook.sendFile('./my_file.txt', fileWithMessage);

// --- Example 5: Pre-styled Helper Embeds ---
await hook.info('System Update', 'The server will be restarted in 5 minutes.');
await hook.success('Deployment Successful!');
await hook.warning('Low Disk Space', 'Only 10% of disk space remaining.');
await hook.error('Critical Error', 'Failed to connect to the database.');

// --- Example 5: Sending a Message with only an Embed ---
const embedOnlyMessage = new Message({
  embeds: [
    new Embed()
      .setTitle('Embed Only Message')
      .setDescription('This message has no content, only an embed.')
      .setColor(0xffa500), // Orange color
  ],
});
hook.addMessage(embedOnlyMessage);

// --- Example 6: Batch Sending ---
const batchMessage1 = new Message({
  content: 'This is the first message in a batch.',
});
const batchMessage2 = new Message({
  content: 'This is the second message in a batch.',
});
hook.addMessage(batchMessage1);
hook.addMessage(batchMessage2);

// --- Example 7: Editing an Existing Message ---
// You need the full message link or just the message ID
const MESSAGE_LINK_TO_EDIT =
  'https://discord.com/channels/YOUR_GUILD_ID/YOUR_CHANNEL_ID/YOUR_MESSAGE_ID';
const editedMessage = new Message({
  content: 'This message has been updated!',
  editTarget: MESSAGE_LINK_TO_EDIT,
});
hook.addMessage(editedMessage); // Add to queue for sending

// --- Example 8: Deleting an Existing Message ---
// const MESSAGE_ID_TO_DELETE = 'YOUR_MESSAGE_ID';
// await hook.delete(MESSAGE_ID_TO_DELETE);

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

## Browser Compatibility & Backend Proxy

This library is primarily designed for **Node.js (server-side)** environments. While the core message building logic is environment-agnostic, direct use in a web browser is **not recommended** and will likely encounter issues due to:

-   **CORS (Cross-Origin Resource Sharing) Policy:** Web browsers block direct requests to Discord's API from different origins.
-   **Security Risks:** Exposing your Discord webhook URL in client-side code makes it vulnerable to abuse.

For browser-based applications, you should use this library on a **backend server** that acts as a proxy. Your frontend application would send requests to your backend, and your backend would then securely use this library to send messages to Discord.

## Development & Contributing

This project uses [Husky](https://typicode.github.io/husky/) for Git hooks to maintain code quality and automate tasks.

-   **`pre-commit` hook:** Runs `eslint` for linting and `prettier` for code formatting on staged files.
-   **`pre-push` hook:** Automatically bumps the package version (`patch` version) when pushing to the `main` branch.
    **WARNING:** This will create a new version commit and tag every time you push to `main`. Consider using a dedicated release pipeline in CI/CD for more controlled versioning in production environments.

