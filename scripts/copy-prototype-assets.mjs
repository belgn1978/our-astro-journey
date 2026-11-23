import { copyFile, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = join(root, 'dist');

const files = [
  'assets/css/reset.css',
  'assets/css/styles.css',
  'assets/css/support.css',
  'assets/js/analytics-control.js',
  'assets/js/main.js',
  'assets/js/site-updates.js',
  'assets/js/support.js',
  'assets/images/branding/logo.png',
  'assets/images/branding/favicon-32x32.png',
  'assets/images/branding/favicon-16x16.png',
  'assets/images/branding/apple-touch-icon.png',
  'assets/images/branding/hero-ing.jpg',
  'privacy.html',
  'terms.html',
];

for (const relativePath of files) {
  const destination = join(output, relativePath);
  await mkdir(dirname(destination), { recursive: true });
  if (relativePath === 'privacy.html' || relativePath === 'terms.html') {
    let html = await readFile(join(root, relativePath), 'utf8');
    html = html.replace(/href="([^"]+)"/g, (match, href) => {
      if (href.startsWith('#') || /^(https?:|mailto:|tel:|javascript:)/i.test(href)) return match;
      const url = new URL(href, 'https://ourastrojourney.co.uk/');
      if (['/', '/privacy.html', '/terms.html'].includes(url.pathname)) {
        return `href="${url.pathname}${url.search}${url.hash}"`;
      }
      return `href="${url.href}"`;
    });
    html = html.replace(/<script\s+src="(?:\.\/|\/)?assets\/js\/main\.js[^>]*><\/script>/i, '<script src="/assets/js/site-shell.js" defer></script>');
    await writeFile(destination, html);
  } else {
    await copyFile(join(root, relativePath), destination);
  }
}

const originalImageDirectory = 'assets/images/interviews/death-valley-observatories';
const imageDirectory = join(root, originalImageDirectory);
for (const entry of await readdir(imageDirectory, { withFileTypes: true })) {
  if (!entry.isFile() || !/\.(jpe?g)$/i.test(entry.name)) continue;
  const relativePath = `${originalImageDirectory}/${entry.name}`;
  const destination = join(output, relativePath);
  await mkdir(dirname(destination), { recursive: true });
  await copyFile(join(root, relativePath), destination);
}

const shellScript = 'assets/js/site-shell.js';
const shellDestination = join(output, shellScript);
await mkdir(dirname(shellDestination), { recursive: true });
await copyFile(join(root, 'src/scripts/site-shell.js'), shellDestination);

console.log(`Copied legacy assets and full-resolution DVO originals into ${output}`);
