import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { phpDevServer, PHP_DEV_HOST, PHP_DEV_PORT } from './scripts/php-dev-server';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  /*
    The contact form posts to `api/send.php`, which only runs if something
    executes PHP. Vite cannot, so in development `phpDevServer` starts PHP's
    built-in server on api/ and /api is proxied to it. Set VITE_API_PROXY
    (e.g. an XAMPP URL) to use an external server instead.
  */
  const externalProxy = env.VITE_API_PROXY;
  const apiProxy = externalProxy || `http://${PHP_DEV_HOST}:${PHP_DEV_PORT}`;

  return {
    plugins: [react(), phpDevServer(!externalProxy)],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: apiProxy,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    build: {
      target: 'es2020',
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          // Split heavy animation libs out of the main chunk so the
          // landing critical path stays lean (perf budget).
          manualChunks: {
            motion: ['framer-motion'],
            lenis: ['@studio-freight/lenis'],
          },
        },
      },
    },
  };
});
