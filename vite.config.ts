import { defineConfig } from 'vite';
import path from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'DiscordWebhookLibrary',
      fileName: (format) => {
        if (format === 'es') return 'discord-webhook-library.es.js';
        if (format === 'cjs') return 'discord-webhook-library.cjs';
        return `discord-webhook-library.${format}.js`;
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['node-fetch', 'form-data', 'axios', 'fs'],
      output: {
        globals: {
          'node-fetch': 'fetch',
          'form-data': 'FormData',
          axios: 'axios',
          fs: 'fs',
        },
        exports: 'named',
      },
    },
  },
  plugins: [dts()],
});
