import { defineConfig } from 'vite';

export default defineConfig({
  // No plugins needed for vanilla JS project
  server: {
    port: 3001, // Using a different port than google_maps
  },
  build: {
    outDir: 'dist',
  }
});