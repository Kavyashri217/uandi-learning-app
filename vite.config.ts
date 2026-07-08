import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' + HashRouter means the built app in dist/ can be opened
// directly from the file system (double-click index.html) — handy for
// NGO computers without a dev setup.
export default defineConfig({
  plugins: [react()],
  base: './',
  server: { port: 5174, strictPort: true },
});
