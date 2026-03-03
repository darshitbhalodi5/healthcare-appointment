# Next.js Application Setup Configuration (latest)

Last updated: March 3, 2026  
Project path: `/home/darshit/Documents/doctor/latest`  
Reference: your terminal screenshot of `create-next-app` prompts.

## 1. Setup Command Used

```bash
cd /home/darshit/Documents/doctor/latest
npx create-next-app .
```

## 2. Prompt Choices (from setup flow)

- TypeScript: `Yes`
- Linter: `ESLint`
- React Compiler: `Yes`
- Tailwind CSS: `Yes`
- Use `src/` directory: `Yes`
- App Router: `Yes`
- Customize import alias: `No` (kept default `@/*`)

## 3. Generated Stack

- Framework: `next@16.1.6`
- UI library: `react@19.2.3`, `react-dom@19.2.3`
- TypeScript: enabled (`tsconfig.json`)
- Linting: ESLint 9 + `eslint-config-next`
- Styling: Tailwind CSS v4 via `@tailwindcss/postcss`
- Routing model: Next.js App Router (`src/app`)
- React Compiler: enabled in `next.config.ts`

## 4. Actual Config Files (Verified)

## `package.json`

- Scripts:
  - `dev`: `next dev`
  - `build`: `next build`
  - `start`: `next start`
  - `lint`: `eslint`

## `next.config.ts`

- `reactCompiler: true`

## `tsconfig.json`

- `strict: true`
- path alias:
  - `@/*` -> `./src/*`

## `eslint.config.mjs`

- uses:
  - `eslint-config-next/core-web-vitals`
  - `eslint-config-next/typescript`

## `postcss.config.mjs`

- plugin:
  - `@tailwindcss/postcss`

## App structure

- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/globals.css`

## 5. Setup Output Notes

- Project template initialized with `app-tw`.
- Dependencies and devDependencies installed successfully.
- Route types generated successfully.
- Git repository initialized in `latest`.

## 6. Environment Note from Setup

Observed runtime tools in your environment:
- Node: `v22.11.0`
- npm: `11.6.2`

Setup output showed an engine warning for one package requiring:
- Node `^20.19.0 || ^22.13.0 || >=24`

Recommendation for cleaner installs:
- upgrade Node from `22.11.0` to `22.13.x` (or newer LTS-compatible version).

## 7. What This Means Right Now

- Next.js foundation is correctly created and ready for migration.
- No business pages/features have been migrated yet from `health1/client`.
- This repo should now be treated as the target frontend for client-ready transition.

