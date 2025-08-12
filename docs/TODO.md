# TODO List for Discord Webhook Library

This document outlines remaining tasks and potential future enhancements for the library.

## 1. Comprehensive Test Coverage

- **What:** Add dedicated unit tests for individual components (e.g., `Embed`, `Message`, `Field`, `Footer`, `Image`, `Thumbnail`) to ensure their `toJSON()`/`getPayload()` methods work correctly in isolation. Expand integration tests to cover more edge cases and specific error scenarios.
- **Why:** Improve overall library robustness, ensure individual parts function as expected, and verify behavior for unexpected inputs or API responses. This reduces regressions and increases confidence in the library.
- **How:**
    - Create `*.test.ts` files for each component in `tests/`.
    - For unit tests, mock external dependencies (like `fetch` for `Webhook` tests) to isolate the component being tested.
    - Implement tests for invalid inputs (e.g., empty strings where required, excessively long content, invalid URLs).
    - Add tests that simulate Discord API error responses (e.g., 400, 429, 500 status codes) and verify the library's error handling.

## 2. Rate Limiting Implementation

- **What:** Implement a robust rate-limiting mechanism within the `Webhook.send()` method.
- **Why:** Discord's API has strict rate limits. Implementing this prevents your webhook from being temporarily blocked or banned due to too many requests in a short period, ensuring reliable message delivery.
- **How:**
    - Research Discord's specific rate limit headers and rules for webhooks (e.g., `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset-After`).
    - Implement a queueing system with delays or a token bucket algorithm to space out requests.
    - Add retry logic for 429 (Too Many Requests) responses.

## 3. Enhanced Error Handling and User Feedback

- **What:** Introduce more specific error types or include Discord API error details in thrown exceptions. Consider modifying `Webhook.send()` to return a detailed result object for batch operations, indicating success/failure for each message.
- **Why:** Provide clearer and more actionable diagnostics for library users, allowing them to handle specific API errors more effectively. A detailed result object for batch sends enables partial success reporting and easier debugging.
- **How:**
    - Define custom error classes (e.g., `DiscordAPIError`) that extend `Error` and include properties for Discord status codes, error messages, etc.
    - Parse the `response.text()` from Discord's API errors to extract relevant details.
    - Adjust `Webhook.send()` to throw these custom errors or return a structured object containing success/failure status for each message in a batch.

## 4. Detailed API Documentation

- **What:** Add comprehensive JSDoc comments to all public classes, methods, and properties in the source code.
- **Why:** Improve developer experience by providing clear, accessible documentation directly in the code. This also allows for automatic generation of API documentation using tools like TypeDoc.
- **How:** Go through each `.ts` file and add JSDoc blocks (`/** ... */`) above relevant code elements, describing their purpose, parameters, return values, and any important usage notes.

## 5. File Attachments Support

- **What:** Implement functionality to attach files to webhook messages.
- **Why:** File attachments are a core feature of Discord webhooks and significantly expand the library's utility, allowing users to send images, documents, and other media.
- **How:**
    - Research Discord's API for file uploads via webhooks, which typically involves sending `multipart/form-data` requests.
    - Modify the `Message` class to accept file data (e.g., `Buffer`, `Blob`, or file paths).
    - Update `Webhook._sendOne()` to construct and send `multipart/form-data` requests when files are present in the message payload.

## 6. License File

- **What:** Create a `LICENSE` file in the root of the repository.
- **Why:** Clearly define the terms under which your code can be used, distributed, and modified. This protects both you as the author and users of your library, and is essential for open-source projects.
- **How:** Choose an open-source license (e.g., MIT, Apache 2.0, GPL), create a file named `LICENSE` (no extension) in the project root, and paste the full text of the chosen license into it.
