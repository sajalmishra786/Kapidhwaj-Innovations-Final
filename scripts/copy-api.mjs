/**
 * Copies the PHP contact API into the build output so `dist/` is a complete,
 * deployable folder. Runs automatically after `npm run build` (postbuild).
 *
 * Skipped silently if `api/` does not exist, so the build never breaks for
 * anyone who removes the PHP relay.
 */
import { cp, access, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath, URL } from 'node:url';

const src = fileURLToPath(new URL('../api', import.meta.url));
const dest = fileURLToPath(new URL('../dist/api', import.meta.url));

/** Never ship logs or the credential template into a public directory. */
const SKIP = new Set(['debug.log', 'config.example.php']);

try {
  await access(src);
} catch {
  console.log('[copy-api] no api/ directory — skipping');
  process.exit(0);
}

try {
  // Clear any previous copy so removed files don't linger in the build.
  await rm(dest, { recursive: true, force: true });
  await mkdir(dest, { recursive: true });
  await cp(src, dest, {
    recursive: true,
    force: true,
    filter: (path) => !SKIP.has(path.split(/[\\/]/).pop() ?? ''),
  });
  console.log('[copy-api] api/ → dist/api/');
} catch (err) {
  // The bundle itself is already built and valid at this point, so a copy
  // failure (permissions, locked file) should warn rather than fail the build.
  console.warn(`[copy-api] could not copy api/ into dist/: ${err.message}`);
  console.warn('[copy-api] copy the api/ folder into your web root manually.');
}
