/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Where the contact form POSTs. Defaults to '/api/send.php' (the PHP relay
   * that ships in this repo). Set this only if the API lives on another host.
   */
  readonly VITE_CONTACT_ENDPOINT?: string;
  /**
   * Dev-only: origin + path Apache serves `api/` from, so `npm run dev` can
   * proxy /api there and let PHP actually execute. See vite.config.ts.
   */
  readonly VITE_API_PROXY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
