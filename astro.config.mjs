import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://ourastrojourney.co.uk',
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file' },
});
