# Changelog

## 0.9.2

### Added

- Multi-webhook support.

### Fixed

- Addressed line ending inconsistencies by configuring Git's `core.autocrlf` and adding a `.gitattributes` file.

### Changed

- Separated `lint` and `lint:fix` npm scripts for clearer distinction between linting and auto-fixing.
- Updated `lint-staged` configuration to use `npm run lint:fix` for automatic linting fixes on commit.

## 0.9.0

### Added

- **Improved Error Handling:** Introduced custom error classes (`WebhookError`, `ValidationError`, `RequestError`, `FileSystemError`) for more descriptive and convenient error messages. This allows for easier programmatic handling of different error types.
- **Flexible Message Sending:** Enabled sending messages that contain only embeds (without any text content), as long as the embeds themselves are valid and contain content. This aligns with Discord API behavior.
- **Expanded Test Coverage:** Added new test cases to cover scenarios such as sending messages with only embeds and handling various error conditions, ensuring greater stability and reliability.

### Changed

- Refactored error handling throughout the library to utilize the new custom error classes, centralizing validation logic within the `zod` schema.
- Updated `README.md` to reflect the new features and provide an example of sending embed-only messages.
- Updated `package.json` version to `0.9.0`.

### Fixed

- Resolved linting and formatting issues across the codebase, ensuring adherence to code style guidelines.
