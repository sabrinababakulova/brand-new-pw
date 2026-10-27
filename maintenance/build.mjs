import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Only explicit public assets are packaged; never copy server configs or reports.
const root = dirname(fileURLToPath(import.meta.url));
const output = join(root, '.site');
const sourceAssets = ['bubblegum.css', 'fonts.css', 'favicon.svg', 'bubblegum-contact.js', 'gum-contact.js', 'gum-layout.js'];
const vendorAssets = ['three.module.min.js', 'three.core.min.js', 'space-medium.ttf', 'space-bold.ttf', 'three-LICENSE.txt', 'SpaceGrotesk-OFL.txt'];
const copies = [
  ['index.html', 'index.html'],
  ...sourceAssets.map(name => [name, `_wip/${name}`]),
  ...vendorAssets.map(name => [`vendor/${name}`, `_wip/${name}`]),
];
for (const [source] of copies) {
  if (!existsSync(join(root, source))) throw new Error(`Missing maintenance asset: ${source}`);
}
for (const [source, destination] of copies) {
  mkdirSync(dirname(join(output, destination)), { recursive: true });
  copyFileSync(join(root, source), join(output, destination));
}
console.log(`Packaged ${copies.length} public files in ${output}`);
