
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Wodapuz frontend — a React 19 + TypeScript SPA built with Vite 7.

## Project Initialization

**IMPORTANT:** When the user says "initialize the project" or "start the project", perform the following steps:
1. Start the frontend dev server (`npm run dev`) in the background
2. Start the backend server (in `../wodapuz-backend` with `npm run dev`) in the background
3. Open the website in Chrome **under your control** using the Chrome DevTools MCP tools (`mcp__chrome-devtools__navigate_page` or `mcp__chrome-devtools__new_page`), not just launching Chrome with bash

## Commands

- `npm run dev` — Start dev server with HMR
- `npm run build` — Type-check with `tsc -b` then bundle with Vite
- `npm run lint` — Run ESLint (flat config, TS + React hooks + React Refresh rules)
- `npm run lint:fix` — Auto-fix ESLint issues
- `npm run format` — Format all files with Prettier
- `npm run format:check` — Check if files are formatted correctly
- `npm run preview` — Preview production build locally

## Code Formatting

**IMPORTANT:** After editing any code files (`.ts`, `.tsx`, `.css`), always run `npm run format` to ensure consistent formatting with Prettier. This should be done before committing changes.

## Tech Stack

- **React 19** with `react-dom/client` (`createRoot` API)
- **TypeScript 5.9** — strict mode enabled, `noUnusedLocals` and `noUnusedParameters` enforced
- **Vite 7** — ESM-only (`"type": "module"`), `@vitejs/plugin-react`
- **ESLint 9** — flat config (`eslint.config.js`), includes `typescript-eslint`, `react-hooks`, and `react-refresh` plugins

## Architecture

- Entry point: `index.html` → `src/main.tsx` → `<App />`
- `src/main.tsx` wraps the app in `<StrictMode>`
- Static assets in `public/` are served at root; assets in `src/assets/` are processed by Vite

## TypeScript Config

Two project references: `tsconfig.app.json` (app source in `src/`) and `tsconfig.node.json` (Vite config). Target is ES2022 with bundler module     resolution. `verbatimModuleSyntax` is enabled — use `import type` for type-only imports.
