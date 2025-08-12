# Discord Webhook Payload Structure

This document outlines the structure of the JSON payload used to send messages to a Discord webhook. This information is based on the official Discord Developer Portal documentation.

## Top-Level Object

The entire message is a single JSON object sent as the body of a `POST` request to the webhook URL.

### Core Requirement

You **must** provide a value for at least one of the following top-level properties: `content`, `embeds`, or `file`. The message cannot be empty.

### Top-Level Properties

| Property      | Type                     | Description                                                                                       | Optional |
| ------------- | ------------------------ | ------------------------------------------------------------------------------------------------- | -------- |
| `content`     | string                   | The main text content of the message. Markdown is supported. (Max 2000 characters)                | Yes      |
| `username`    | string                   | Overrides the default username of the webhook for this specific message.                          | Yes      |
| `avatar_url`  | string                   | Overrides the default avatar of the webhook for this specific message. Must be a valid image URL. | Yes      |
| `tts`         | boolean                  | If `true`, the message will be read aloud using text-to-speech.                                   | Yes      |
| `embeds`      | array of `Embed` objects | An array containing up to 10 `Embed` objects. This is used for richly formatted content.          | Yes      |
| `thread_name` | string                   | If the webhook is in a forum channel, this will create a new thread with this name.               | Yes      |

---

## The `Embed` Object

An `Embed` object is where you define the rich, structured content of a message. All properties of an `Embed` object are optional, but you must provide at least a `title` or `description` for it to be useful.

| Property      | Type                     | Description                                                                                                | Optional |
| ------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------- | -------- |
| `title`       | string                   | The title of the embed.                                                                                    | Yes      |
| `description` | string                   | The main text content of the embed. Markdown is supported.                                                 | Yes      |
| `url`         | string                   | A URL that, when provided, turns the `title` text into a hyperlink.                                        | Yes      |
| `timestamp`   | string                   | An ISO8601 formatted timestamp (e.g., `2025-08-06T18:30:00.000Z`) that is displayed in the embed's footer. | Yes      |
| `color`       | integer                  | The color code for the accent strip on the left side of the embed.                                         | Yes      |
| `footer`      | `Footer` object          | A footer that appears at the bottom of the embed.                                                          | Yes      |
| `image`       | `Image` object           | A large image to be displayed at the bottom of the embed.                                                  | Yes      |
| `thumbnail`   | `Thumbnail` object       | A small thumbnail image that appears in the top-right corner of the embed.                                 | Yes      |
| `author`      | `Author` object          | Information about the author of the embed, displayed at the top.                                           | Yes      |
| `fields`      | array of `Field` objects | A list of name-value pairs to display in a grid-like format within the embed.                              | Yes      |

---

## Component Objects

These are smaller objects that are nested within the `Embed` object.

### `Footer` Object

| Property   | Type   | Description                              | Required |
| ---------- | ------ | ---------------------------------------- | -------- |
| `text`     | string | The text to display in the footer.       | **Yes**  |
| `icon_url` | string | A URL for a small icon next to the text. | No       |

### `Image` Object

| Property | Type   | Description                          | Required |
| -------- | ------ | ------------------------------------ | -------- |
| `url`    | string | A URL for the image to be displayed. | **Yes**  |

### `Thumbnail` Object

| Property | Type   | Description                              | Required |
| -------- | ------ | ---------------------------------------- | -------- |
| `url`    | string | A URL for the thumbnail to be displayed. | **Yes**  |

### `Author` Object

| Property   | Type   | Description                                         | Required |
| ---------- | ------ | --------------------------------------------------- | -------- |
| `name`     | string | The name of the author.                             | **Yes**  |
| `url`      | string | A URL to link the author's name to.                 | No       |
| `icon_url` | string | A URL for a small icon to display next to the name. | No       |

### `Field` Object

| Property | Type    | Description                                                                    | Required |
| -------- | ------- | ------------------------------------------------------------------------------ | -------- |
| `name`   | string  | The name/title of the field.                                                   | **Yes**  |
| `value`  | string  | The value/text of the field.                                                   | **Yes**  |
| `inline` | boolean | If `true`, the field can be displayed on the same line as other inline fields. | No       |
