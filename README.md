# KeyBloom Typing Practice

KeyBloom is a multilingual English typing game built with React, TypeScript, and Vite. Its interface supports English, Traditional Chinese, Japanese, and Korean. Complete 20 hits in each of the 20 levels to advance. Progress is automatically saved in your browser.

[Play KeyBloom](https://keybloom-typing-game.nickycho.workers.dev)

## Local development

Use Node.js 24.11.1, as specified in `.node-version`.

```bash
npm ci
npm run dev
```

## Production build and preview

```bash
npm run build
npm run preview
```

The production site is generated in `dist/`. Before deploying, check keyboard input, level unlocking, and progress persistence after a page refresh.

## Deploy to Cloudflare with the CLI

The project uses Wrangler CLI to upload the locally built `dist/` directory to Cloudflare Workers Static Assets. The source is hosted in the [GitHub repository](https://github.com/nickycho/typing-game).

Before your first deployment, log in to Cloudflare:

```bash
npx wrangler login
```

Complete the authorization in your browser. For the initial deployment and subsequent updates, run:

```bash
npm run deploy
```

This command runs the TypeScript checks and production build, then deploys `dist/` to `keybloom-typing-game` using `wrangler.jsonc`. The first deployment creates the Worker; there is no need to create a separate Pages project. Share the `*.workers.dev` production URL returned by the CLI.

Cloudflare serves the static files directly, with a fallback for single-page application routes. Pushing to GitHub does not automatically update the site; GitHub Actions can be added for automatic deployment.

This version has no backend API and does not require API keys or a database. Wrangler manages its credentials locally; do not commit them to version control.

- [Cloudflare Static Assets deployment guide](https://developers.cloudflare.com/workers/static-assets/get-started/)
- [Cloudflare SPA configuration](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/)

## Saving progress

Progress is stored in the browser's `localStorage` under `keybloom.progress.v1`. Each device, browser, and website origin has its own progress; progress from the local development URL does not automatically transfer to the production site. Clearing site data or using private browsing may prevent progress from being retained.

The game is designed for a physical keyboard. Account sign-in and cross-device synchronization are not currently available.

## Interface languages

On the first visit, KeyBloom selects a supported language from the browser's `navigator.languages` or `navigator.language`. Chinese locale variants use Traditional Chinese, and English is the fallback when no supported language matches.

Use the language menu in the header to switch languages at any time. The preference is stored separately in `localStorage` under `keybloom.locale.v1` and takes priority on later visits. Switching languages does not reset levels or scores. If storage is unavailable, the language can still be changed for the current session.

Interface and level translations are maintained in `src/i18n/messages.ts`. The page title, description, and accessibility text also change with the selected language. The typing exercises continue to use the English letters A–Z.
