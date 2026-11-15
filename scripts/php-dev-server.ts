/**
 * Vite plugin: runs PHP's built-in web server for `api/` while `npm run dev`
 * is up, so the contact form works without XAMPP/Apache.
 *
 * Vite cannot execute PHP itself, so /api is proxied to this server
 * (see vite.config.ts). If VITE_API_PROXY is set, that external server is used
 * instead and this plugin does nothing.
 */
import { spawn, type ChildProcess } from 'node:child_process';
import { fileURLToPath, URL } from 'node:url';
import type { Plugin } from 'vite';

export const PHP_DEV_HOST = '127.0.0.1';
export const PHP_DEV_PORT = 8787;

const API_DIR = fileURLToPath(new URL('../api', import.meta.url));

export function phpDevServer(enabled: boolean): Plugin {
  let child: ChildProcess | null = null;

  const stop = () => {
    if (child && !child.killed) child.kill();
    child = null;
  };

  return {
    name: 'php-dev-server',
    apply: 'serve',
    configureServer(server) {
      if (!enabled) return;
      const log = server.config.logger;
      const address = `${PHP_DEV_HOST}:${PHP_DEV_PORT}`;

      child = spawn('php', ['-S', address, '-t', API_DIR], {
        stdio: ['ignore', 'ignore', 'pipe'],
      });

      child.on('error', (err: NodeJS.ErrnoException) => {
        const hint =
          err.code === 'ENOENT'
            ? 'PHP is not installed or not on PATH (macOS: `brew install php`).'
            : err.message;
        log.error(`[php] could not start the contact API server: ${hint}`);
        log.error('[php] Or set VITE_API_PROXY in .env.local to an Apache URL serving api/.');
        child = null;
      });

      // php -S writes its request log and errors to stderr. Surface only the
      // useful lines (errors, failed sends) instead of every request.
      child.stderr?.on('data', (buf: Buffer) => {
        for (const line of buf.toString().split('\n')) {
          if (/Failed to listen|Address already in use/i.test(line)) {
            log.error(`[php] port ${PHP_DEV_PORT} is busy — stop the other process or set VITE_API_PROXY.`);
          } else if (/\[contact\]|PHP (Fatal|Parse|Warning)/.test(line)) {
            log.warn(`[php] ${line.trim()}`);
          }
        }
      });

      child.on('exit', (code) => {
        if (code && code !== 0) log.error(`[php] contact API server exited with code ${code}`);
        child = null;
      });

      log.info(`  ➜  PHP API: http://${address} (proxied at /api)`);
      server.httpServer?.once('close', stop);
      process.once('exit', stop);
    },
  };
}
