import { defineConfig } from 'vite';
import path from 'path';
import dts from 'vite-plugin-dts'; // Import the plugin

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'DiscordWebhookLibrary',
      fileName: (format) => `discord-webhook-library.${format}.js`,
    },
    rollupOptions: {
      external: ['node-fetch'], // Externalize dependencies that shouldn't be bundled
      output: {
        globals: {
          'node-fetch': 'fetch',
        },
      },
    },
  },
  plugins: [dts()], // Add the plugin here
});
