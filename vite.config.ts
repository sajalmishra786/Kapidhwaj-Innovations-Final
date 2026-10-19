import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  /*
    The contact form posts to `api/send.php`, which only runs if something
    executes PHP. Vite's dev server does not — it would hand back the file as
    plain text — so in development we proxy /api straight to Apache (XAMPP).
    Point VITE_API_PROXY at wherever Apache serves this project's `api/` folder.
  */
  const apiProxy = env.VITE_API_PROXY || 'http://localhost/pro-ject/kapidhaj_innovations/api';

  return {
    plugins: [react()],
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
