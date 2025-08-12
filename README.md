# Discord Webhook Library

A powerful and easy-to-use library for creating and sending richly formatted messages to Discord webhooks.

This library simplifies the process of constructing the JSON payload for Discord webhooks, providing a clean and intuitive interface for all supported features. It is designed to mirror the structure and capabilities of tools like [Discohook](https://discohook.org/), allowing you to build complex messages with ease.

## Features

- **User Identity:** Customize the webhook's `username` and `avatar_url`.
- **Rich Content:** Send plain `content` messages.
- **Embeds:** Create detailed and beautiful embeds with support for:
  - `title`
  - `description`
  - `color`
  - `author`
- `fields`
  - `thumbnail`
  - `image`
  - `footer` with `text` and `icon_url`
  - `timestamp`
- **File Attachments:** (Coming Soon) Attach files to your messages.
- **Text-to-Speech:** Send messages using Discord's `tts` feature.

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
import { Webhook, Embed } from 'discord-webhook-library';

const hook = new Webhook('YOUR_WEBHOOK_URL');

const embed = new Embed()
  .setTitle('Hello World!')
  .setDescription('This is a test embed from the discord-webhook-library.')
  .setColor('#0099ff')
  .setAuthor({ name: 'Gemini', icon_url: 'https://i.imgur.com/AfFp7pu.png' })
  .addFields({ name: 'Regular field title', value: 'Some value here' })
  .setThumbnail('https://i.imgur.com/AfFp7pu.png')
  .setImage('https://i.imgur.com/AfFp7pu.png')
  .setTimestamp()
  .setFooter({
    text: 'Powered by Gemini',
    icon_url: 'https://i.imgur.com/AfFp7pu.png',
  });

hook.setUsername('Gemini Bot');
hook.setAvatar('https://i.imgur.com/AfFp7pu.png');
hook.send('This is a message with an embed.', [embed]);
```
