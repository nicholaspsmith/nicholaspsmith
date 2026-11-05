import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const FORBIDDEN = /pimp|\bhoes?\b|welfare queen|street walker|slap|\bcane\b/i;
const TEXT = /\.(html|js|mjs|css|json|xml|txt)$/;

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else yield path;
  }
}

const hits = [];
for (const path of walk('dist')) {
  if (FORBIDDEN.test(path)) hits.push(`${path}: file name`);
  if (!TEXT.test(path)) continue;
  const match = readFileSync(path, 'utf8').match(FORBIDDEN);
  if (match) hits.push(`${path}: ${match[0]}`);
}

if (hits.length) {
  console.error(`Forbidden words found:\n${hits.join('\n')}`);
  process.exit(1);
}
console.log('Vocabulary check passed.');
