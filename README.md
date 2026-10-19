# Kapidhwaj Innovations — Landing

A cinematic, production-ready React landing page for **Kapidhwaj Innovations** — a
product studio that designs, engineers, and ships first-class SaaS: its own
platforms (Nucleus, Atlas, Aegis, Pulse) and the products its partners rely on.
Motion-led, built in the spirit of premium modern web design (Apple × Linear ×
Vercel × Stripe).

---

## Table of contents

1. [Tech stack](#tech-stack)
2. [Prerequisites](#prerequisites)
3. [Setup — step by step](#setup--step-by-step)
4. [Available scripts](#available-scripts)
5. [Architecture](#architecture)
6. [Editing the site content](#editing-the-site-content)
7. [Contact form — email delivery](#contact-form--email-delivery)
8. [Design tokens & styling](#design-tokens--styling)
9. [Building for production](#building-for-production)
10. [Deployment](#deployment)
11. [Troubleshooting](#troubleshooting)
12. [Performance & accessibility](#performance--accessibility)

---

## Tech stack

| Layer      | Choice                                                            |
| ---------- | ----------------------------------------------------------------- |
| Framework  | **React 19** + **TypeScript 5.7**                                  |
| Build tool | **Vite 6**                                                         |
| Styling    | **Tailwind CSS 3.4** (tokens mirrored into CSS custom properties)  |
| Motion     | **Framer Motion 11** — entrance, scroll-driven, and layout animation |
| Scroll     | **Lenis** — rAF smooth scroll (auto-disabled under reduced motion) |
| Icons      | **react-icons 5**                                                  |

---

## Prerequisites

Install these before you start:

- **Node.js 20.19+ or 22.12+** — Vite 6 will not run on older majors.
  Check with `node -v`. Download from [nodejs.org](https://nodejs.org) or use
  [nvm](https://github.com/nvm-sh/nvm): `nvm install 22 && nvm use 22`.
- **npm 10+** — ships with Node. Check with `npm -v`.
- **Git** — only needed if you are cloning rather than working from a copy.

A modern browser (Chrome, Edge, Firefox, Safari) is required for the dev server.
No database, backend, or environment variables are needed — this is a fully
static front end.

---

## Setup — step by step

### Step 1 — Get the code

If you are cloning from a repository:

```bash
git clone <repository-url> kapidhaj_innovations
cd kapidhaj_innovations
```

If you already have the project folder, just open a terminal inside it:

```bash
cd path/to/kapidhaj_innovations
```

### Step 2 — Confirm your Node version

```bash
node -v    # expect v20.19+ or v22.12+
npm -v     # expect 10 or newer
```

If the version is too old, install a newer Node and re-run the check. Getting
this right first avoids most install-time errors.

### Step 3 — Install dependencies

```bash
npm install
```

This creates `node_modules/` and resolves the lockfile. Expect it to take
30–90 seconds on a first run.

> **Reproducible installs:** in CI or on a teammate's machine, prefer
> `npm ci` — it installs exactly what `package-lock.json` pins and fails if the
> lockfile and `package.json` disagree.

> **Important:** `node_modules/` is platform-specific. If you copied the folder
> from another machine (macOS → Linux, or vice versa), delete it and reinstall.
> See [Troubleshooting](#troubleshooting).

### Step 4 — Add the team images

The team grid expects six transparent PNGs in `public/images/team/`. The repo
ships with these filenames:

```
public/images/team/
├── person_1_1781765906506.png
├── person_2_1781765919099.png
├── person_3_1781765931874.png
├── person_4_1781765942879.png
├── person_5_1781765958760.png
└── person_6_1781765970883.png
```

To use your own photos, drop them into that folder and update the
`TEAM_IMAGES` array at the top of
`src/components/UnicornTeam/UnicornTeam.tsx`. Anything inside `public/` is
served from the site root, so `public/images/team/foo.png` is referenced in code
as `/images/team/foo.png`.

> Use **transparent** PNGs. The purple epicenter animation washes *behind* each
> person, so an opaque rectangular background will block the effect.

### Step 5 — Start the dev server

```bash
npm run dev
```

Vite prints a local URL — by default:

```
  ➜  Local:   http://localhost:5173/
```

Open it in a browser. Edits to any file under `src/` hot-reload instantly.

To expose the server to other devices on your network (handy for testing the
scroll animations on a real phone):

```bash
npm run dev -- --host
```

### Step 6 — Verify the build

Before committing or deploying, confirm the project type-checks and compiles:

```bash
npm run build
```

This runs `tsc -b` (type-check across all `tsconfig` project references) and
then `vite build`. Output lands in `dist/`. If the type-check fails, the build
stops — fix the reported errors before deploying.

### Step 7 — Preview the production build

```bash
npm run preview
```

Serves `dist/` at <http://localhost:4173>. Always sanity-check here rather than
only in dev: code splitting, asset hashing, and minification only apply to the
production bundle.

---

## Available scripts

| Command           | What it does                                                     |
| ----------------- | ---------------------------------------------------------------- |
| `npm run dev`     | Dev server with HMR at `:5173`, proxying `/api` to Apache          |
| `npm run build`   | Type-check (`tsc -b`) then production build into `dist/`          |
| `npm run preview` | Serve the built `dist/` locally at `:4173`                        |
| `npm run lint`    | ESLint. **Requires setup** — see the note below                   |

`postbuild` runs automatically after `build` and copies `api/` into `dist/api/`.

> **`npm run lint` is not wired up yet.** The script exists in `package.json`,
> but ESLint is not in `devDependencies` and there is no config file, so the
> command currently fails. To enable it:
> `npm i -D eslint @eslint/js typescript-eslint eslint-plugin-react-hooks eslint-plugin-react-refresh globals`
> then add an `eslint.config.js`. Until then, `npm run build` is the type-safety
> gate.

---

## Architecture

```
kapidhaj_innovations/
├── index.html               entry HTML — meta tags, Google Fonts, #root
├── vite.config.ts           plugins, `@` alias, chunk splitting, /api dev proxy
├── api/                     PHP contact-form relay (SMTP via PHPMailer)
│   ├── send.php             validated endpoint → your inbox + auto-reply
│   ├── config.example.php   credentials template — copy to config.php
│   ├── composer.json        phpmailer dependency
│   └── .htaccess            denies direct access to config + vendor
├── scripts/copy-api.mjs     postbuild: copies api/ into dist/
├── tailwind.config.ts       design tokens (colours, fonts, keyframes)
├── postcss.config.js        tailwind + autoprefixer pipeline
├── tsconfig*.json           project-reference type-check setup
├── public/
│   └── images/team/         static assets, served from the site root
└── src/
    ├── main.tsx             React root
    ├── App.tsx              section order, lazy boundaries, <SectionWrapper>s
    ├── index.css            Tailwind layers + global custom properties
    ├── components/
    │   ├── Navbar/              floating glass dock, morphing active pill
    │   ├── Hero/                headline + a card that flies in and peels open into a fan (entrance only, no scroll motion)
    │   ├── InfiniteScroll/      seamless dual-row partner marquee
    │   ├── UnicornTeam/         mathematical epicenter scroll-reveal grid
    │   ├── StackCards/          upward file-folder stacking cards
    │   ├── SaaSDesignStepper/   pinned scroll-driven process stepper
    │   ├── CircleScroll/        "Why Choose Us" orbital wheel
    │   ├── WaveGallery/         wave-offset parallax gallery
    │   ├── Products/            tilt cards with reactive glow
    │   ├── StorytellingSection/ scene-by-scene narrative block
    │   ├── FAQ/                 single-open accordion
    │   ├── Contact/             floating-label form with validation
    │   ├── Footer/              gradient-mesh footer + newsletter
    │   └── ui/                  AnimatedText, MagneticButton, ScrollRevealText,
    │                            SectionHeading, SectionWrapper, …
    ├── hooks/               useLenis, useMagnetic, useScrollProgress,
    │                        useSectionTracker, useReducedMotion
    ├── animations/          shared Framer Motion variants & spring presets
    ├── data/                navigation + all section copy
    └── lib/                 cn() class-merge util
```

### Path alias

`@` resolves to `src/`, declared in both `vite.config.ts` and
`tsconfig.app.json`. Import from the alias rather than with relative hops:

```ts
import { Hero } from '@/components/Hero/Hero';   // ✅
import { Hero } from '../../components/Hero/Hero'; // ❌
```

---

## Editing the site content

Almost all copy lives in **`src/data/content.ts`** — you rarely need to touch a
component to change what the page says.

| Export              | Drives                                            |
| ------------------- | ------------------------------------------------- |
| `HERO`              | Hero headline, description and the two buttons    |
| `HERO_CARDS`        | The fan of cards in the hero (artwork in `Hero/HeroCardArt.tsx`) |
| `HERO_BUBBLES`      | The two speech bubbles pinned to the fan          |
| `PARTNERS_PRIMARY`  | Top marquee row                                   |
| `PARTNERS_SECONDARY`| Bottom marquee row                                |
| `STATS`             | Headline metrics                                  |
| `SCENES`            | Storytelling section                              |
| `SERVICES`          | Stacking service cards                            |
| `PRODUCTS`          | Product grid                                      |
| `TIMELINE`          | "Why Choose Us" orbital wheel steps               |
| `GALLERY`           | Selected-work gallery                             |
| `FAQ_ITEMS`         | FAQ accordion                                     |

Two more places matter:

- **`src/data/navigation.ts`** — the floating nav. Each `id` **must** match a
  `SectionWrapper id` in `App.tsx`, or the scroll-spy highlight will not track.
- **`src/components/SaaSDesignStepper/content.ts`** — the development-process
  steps and their icons.

### Adding or reordering a section

1. Create the component under `src/components/YourSection/`.
2. In `App.tsx`, `lazy()`-import it if it sits below the fold.
3. Wrap it in a `<SectionWrapper id="…" label="…">` and place it in the order
   you want.
4. If it should appear in the nav, add a matching entry to `NAV_ITEMS`.

> **Note on the orbital wheel:** `CircleScroll` sizes its scroll track from
> `TIMELINE.length`. Adding or removing steps automatically re-spaces the nodes
> around the arc — the wheel wraps modulo a full turn, so the semicircle stays
> visually complete at every step without any hand-tuned coordinates.

---

## Contact form — email delivery

Submissions are relayed to **contact@kapidhwajinnovations.com** by a small PHP
endpoint in `api/`, which sends over SMTP using PHPMailer.

```
Browser  ──POST /api/send.php──▶  PHPMailer  ──SMTP──▶  contact@kapidhwajinnovations.com
                                     └────────────────▶  auto-reply to the visitor
```

The form will **not** send until you complete these four steps.

### Step 1 — Install PHPMailer

Requires [Composer](https://getcomposer.org/download/) and PHP 8.0+.

```bash
cd api
composer install
cd ..
```

No Composer available? Download the
[PHPMailer release zip](https://github.com/PHPMailer/PHPMailer/releases) and
extract it to `api/lib/PHPMailer/` — `send.php` falls back to that path
automatically.

### Step 2 — Create your config

```bash
cp api/config.example.php api/config.php
```

Open `api/config.php` and fill in your SMTP credentials. **`config.php` is
gitignored** — never commit it.

For Gmail you need an **App Password**, not your normal password:
Google Account → Security → turn on 2-Step Verification → App passwords →
generate one for "Mail". Paste the 16-character value into `smtp_pass`.

> `from_email` must be an address your SMTP account is allowed to send as —
> normally the same as `smtp_user`. Putting the *visitor's* address there gets
> the mail rejected by SPF/DMARC. The visitor is set as `Reply-To`, so hitting
> Reply in your mail client still answers them directly.

### Step 3 — Point the dev server at Apache

Vite's dev server cannot execute PHP, so `npm run dev` proxies `/api` to Apache.
The default target assumes the project sits at
`htdocs/pro-ject/kapidhaj_innovations/`. If yours is elsewhere, create a
`.env.local` in the project root:

```bash
VITE_API_PROXY=http://localhost/your/path/to/api
```

Then start **both**: Apache from the XAMPP control panel, and `npm run dev`.

### Step 4 — Send a test message

Load the site, fill in the contact form, and submit. On success you should get
two emails: the enquiry in your inbox, and an auto-reply at the address you
entered.

If it fails, set `'debug' => true` in `api/config.php` and retry — the full SMTP
conversation is written to `api/debug.log`. Turn it back off afterwards.

### What the endpoint does for you

- **Server-side validation** mirroring the client rules, returning HTTP 422 with
  per-field messages that the form renders inline. Client validation is a
  convenience; this is the one that counts.
- **Honeypot field** — a hidden `company` input. Bots fill it; submissions that
  do are silently discarded.
- **Rate limiting** — one send per IP per 30s (`rate_limit_seconds`). The
  cooldown only starts after a message actually sends, so a failed validation
  never locks a visitor out.
- **Origin allow-list** — cross-origin POSTs from unlisted origins get a 403.
  Add your production domain to `allowed_origins`.
- **Header-injection protection** — control characters are stripped from all
  input before it reaches any mail header.
- **Auto-reply** to the visitor (toggle with `send_autoreply`). If the auto-reply
  fails, the request still succeeds — the real message already arrived.
- **Generic error text.** SMTP failures are logged server-side; the browser only
  ever sees a safe message, so credentials and hostnames never leak.

### Changing the destination address

Edit `to_email` in `api/config.php`. To also update the address displayed on the
page, change the `INBOX` constant at the top of
`src/components/Contact/Contact.tsx`.

---

## Design tokens & styling

Colours, fonts, and keyframes are defined in `tailwind.config.ts` and mirrored
into CSS custom properties in `src/index.css`. Change them in one place:

- `cream-*` / `ink-*` — the warm neutral base scale
- `accent-*` — highlight hues
- Fonts: **Space Grotesk** (`font-display`), **Inter** (`font-sans`),
  **JetBrains Mono** (`font-mono`), all loaded from Google Fonts in
  `index.html`

Use the `cn()` helper from `src/lib/cn.ts` when composing conditional classes —
it merges Tailwind classes correctly instead of letting duplicates fight.

---

## Building for production

```bash
npm run build
```

`dist/` will contain hashed JS/CSS assets plus everything copied from `public/`.
`vite.config.ts` splits `framer-motion` and `lenis` into their own chunks so the
hero's critical path stays lean.

A `postbuild` step (`scripts/copy-api.mjs`) also copies `api/` into `dist/api/`,
so the built folder is deployable as-is with the contact form intact. `debug.log`
and `config.example.php` are excluded. **`config.php` is copied** — it holds your
SMTP password, so treat `dist/` as sensitive and make sure your host executes PHP
in that directory rather than serving it as text.

---

## Deployment

### Static hosts (Vercel, Netlify, Cloudflare Pages, GitHub Pages)

- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Node version:** 20 or 22

Because this is a single-page app with no router, no rewrite rules are needed.

### Serving from a subfolder (XAMPP / Apache / any subdirectory)

If the site will live at a path rather than a domain root — for example
`http://localhost/pro-ject/kapidhaj_innovations/` under XAMPP's `htdocs` — you
must tell Vite the base path, or every asset will 404 and you will get a blank
page.

1. Add `base` to `vite.config.ts`:

   ```ts
   export default defineConfig({
     base: '/pro-ject/kapidhaj_innovations/',  // must match the served URL path
     // …rest of the config
   });
   ```

2. Rebuild:

   ```bash
   npm run build
   ```

3. Copy the **contents of `dist/`** (not the folder itself) to the directory
   Apache serves — e.g. `/Applications/XAMPP/xamppfiles/htdocs/pro-ject/kapidhaj_innovations/`.

4. Start Apache from the XAMPP control panel and visit the URL.

> Do **not** open `dist/index.html` directly with `file://`. ES modules require
> an HTTP origin; the page will silently fail to boot.

---

## Troubleshooting

**`Cannot find module @rollup/rollup-linux-x64-gnu` (or `-darwin-arm64`)**
`node_modules/` was installed on a different OS or CPU architecture. npm's
optional-dependency resolution is platform-specific:

```bash
rm -rf node_modules package-lock.json
npm install
```

**Blank white page after deploying**
Almost always a `base` path mismatch. Open DevTools → Network and look for 404s
on `/assets/*.js`. Fix `base` in `vite.config.ts` and rebuild — see
[Deployment](#deployment).

**`Port 5173 is already in use`**
Another Vite instance is running. Either stop it, or pick a different port:

```bash
npm run dev -- --port 3000
```

**Build fails on `tsc -b` but the dev server works fine**
Vite's dev server transpiles without type-checking, so type errors only surface
at build time. Read the `tsc` output and fix the reported files — this is
working as intended, not a bug.

**Tailwind classes have no effect**
Confirm the file is covered by the `content` globs in `tailwind.config.ts`.
Tailwind also cannot see dynamically constructed class names — write
`isActive ? 'text-ink-900' : 'text-ink-900/35'`, never
`` `text-ink-${shade}` ``.

**Animations feel stuttery**
Check whether your OS "reduce motion" setting is on — the site intentionally
disables Lenis, parallax, and magnetism in that mode. Otherwise, profile in the
production build (`npm run preview`); the dev build is unminified and slower.

**Team photos show as opaque rectangles**
The source PNGs are not transparent. See [Step 4](#step-4--add-the-team-images).

**Contact form: "The contact form is not configured yet."**
`api/config.php` does not exist. Run `cp api/config.example.php api/config.php`
and fill it in.

**Contact form: "Mail service is unavailable."**
PHPMailer is not installed. Run `composer install` inside `api/`.

**Contact form: the browser downloads `send.php` or shows its source**
Something other than PHP is serving the file — usually the Vite dev server,
because the `/api` proxy target is wrong. Confirm Apache is running and that
`VITE_API_PROXY` points at the folder Apache serves `api/` from.

**Contact form: "Origin not allowed." (403)**
Add the exact origin you are browsing from — scheme, host, *and* port — to
`allowed_origins` in `api/config.php`.

**Contact form: SMTP connect fails on Gmail**
Almost always the password. Gmail rejects account passwords over SMTP; you need
a 16-character App Password with 2-Step Verification enabled. If the connection
times out instead, your ISP or network may block port 587 — try port 465 with
`'smtp_secure' => 'ssl'`. Set `'debug' => true` and read `api/debug.log` for the
exact server response.

---

## Performance & accessibility

- **Code splitting** — everything below the fold is `React.lazy`-loaded. The
  hero renders immediately while heavier animation chunks stream in.
- **Hardware acceleration** — animations stay on compositor-friendly properties
  (`transform`, `opacity`, `filter`); no animated layout properties.
- **Accessibility** — semantic landmarks (`main`, `section`, `nav`, `footer`),
  `aria-current` on the active nav item, focus-visible rings, and labelled form
  fields.
- **Reduced motion** — respects `prefers-reduced-motion`: Lenis smooth scroll,
  parallax, magnetism, and tilt are disabled, and remaining CSS transitions are
  zeroed. Scroll-driven sections fall back to static layouts.
