import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // Replace 'behavior-chart' with the name of your GitHub repository.
  base: '/behavior-chart/',
  plugins: [react()],
});