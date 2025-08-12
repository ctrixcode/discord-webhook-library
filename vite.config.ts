import { defineConfig } from 'vite';
import path from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'DiscordWebhookLibrary',
      fileName: (format) => `discord-webhook-library.${format}.js`,
    },
    rollupOptions: {
      external: ['node-fetch'],
      output: {
        globals: {
          'node-fetch': 'fetch',
        },
      },
    },
  },
  plugins: [dts()],
});
