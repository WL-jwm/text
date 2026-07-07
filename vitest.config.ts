import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      include: ['src/data/**', 'src/services/**'],
      exclude: ['src/data/__tests__/**'],
    },
  },
  resolve: {
    conditions: ['development', 'browser'],
  },
});
