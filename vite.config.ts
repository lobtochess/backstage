import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative asset paths allow this app to run both locally and under
// https://<user>.github.io/<repository>/ on GitHub Pages.
export default defineConfig({
  plugins: [react()],
  base: './',
});
