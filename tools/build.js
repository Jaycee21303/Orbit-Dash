import { cp, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const distDir = join(root, 'dist');

async function main() {
  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });

  const toCopy = ['index.html', 'src', 'README.md', 'LICENSE'];
  await Promise.all(
    toCopy.map(item => cp(join(root, item), join(distDir, item), { recursive: true }))
  );

  console.log('Static build created in dist/');
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
