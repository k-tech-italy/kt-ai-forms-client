import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: {
        rollupOptions: {
            output: {
                dir: 'dist/assets/',
                entryFileNames: 'aiagent.min.js',
                assetFileNames: 'aiagent.min.css',
            }
        }
    }
});