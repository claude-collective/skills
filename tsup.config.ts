import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/cli/index.ts'],
  format: ['esm'],
  platform: 'node',
  target: 'node18',
  clean: true,
  sourcemap: true,
  shims: true,
  dts: false,
  banner: {
    js: '#!/usr/bin/env node',
  },
  outDir: 'dist/cli',
});
