import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { copyFileSync } from 'node:fs';

const root = path.dirname(fileURLToPath(import.meta.url));
for (const file of ['codeSamples.json', 'architectureScenario.json']) {
  copyFileSync(path.resolve(root, '../components', file), path.join(root, 'src/homepage', file));
}
// Prefer a standalone npm install; reuse the checked-out product's dependencies locally.
let resolve;
try {
  resolve = createRequire(path.join(root, 'package.json'));
  resolve.resolve('vite');
} catch {
  resolve = createRequire(path.resolve(root, process.env.CODECHROMA_WEB ?? '../../code-chroma/web', 'package.json'));
}
const viteEntry = path.join(path.dirname(resolve.resolve('vite')), 'dist/node/index.js');
const { build } = await import(pathToFileURL(viteEntry).href);
const dependencies = ['react-dom', 'react', 'elkjs', 'prismjs', 'diff', '@xterm/xterm', '@xterm/addon-fit', '@xterm/addon-webgl', '@xterm/addon-unicode11'];
const aliases = dependencies.map(name => {
  let dir = path.dirname(resolve.resolve(name));
  const parts = name.split('/');
  while (!dir.replaceAll('\\', '/').endsWith('/node_modules/' + parts.join('/'))) dir = path.dirname(dir);
  return { find: name, replacement: dir.replaceAll('\\', '/') };
});
await build({
  root, configFile: false, base: '/product-canvas/',
  resolve: { alias: aliases, preserveSymlinks: true },
  esbuild: { jsx: 'automatic' },
  build: { target: 'esnext', outDir: path.resolve(root, '../public/product-canvas'), emptyOutDir: true },
});
