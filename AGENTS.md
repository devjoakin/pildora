# AGENTS.md

Guidance for coding agents in `C:\Users\joaqu\Desktop\projects\pildora`.

## Scope

- This repo is a React + TypeScript + Vite app with a LangGraph JS agent.
- Package manager is npm (`package-lock.json`).
- Module mode is ESM (`"type": "module"`).
- TypeScript alias `@/*` points to repo root.

## Key Paths

- App entry: `src/main.tsx`
- Main app UI: `src/App.tsx`
- App components: `src/components/*`
- Shared UI primitives: `components/ui/*`
- Shared helpers: `lib/*`
- Agent graph: `src/agents/infoAgent.ts`
- LangGraph config: `langgraph.json`
- Vite config: `vite.config.ts`
- ESLint config: `eslint.config.js`
- TS configs: `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`

## Setup

- Install deps: `npm install`

## Build / Lint / Test Commands

### Development

- Frontend dev server: `npm run dev`
- LangGraph dev server: `npm run dev:server`

### Build

- Production build: `npm run build`
- Notes: runs `tsc -b` then `vite build`

### Lint

- Run lint: `npm run lint`
- Notes: runs ESLint on repo (`eslint .`)

### Preview

- Preview build output: `npm run preview`

### Test Status (Current)

- No `test` script in `package.json`
- No test runner dependency configured
- No `*.test.*` or `*.spec.*` files found

### Single Test (When Tests Are Added)

- Vitest file: `npx vitest run src/path/to/file.test.ts`
- Vitest by name: `npx vitest run src/path/to/file.test.ts -t "test name"`
- Jest file: `npx jest src/path/to/file.test.ts`
- Jest by name: `npx jest src/path/to/file.test.ts -t "test name"`
- Never report test success if tests are not actually runnable.

## Formatting Rules

### Prettier

- Config file: `.prettierrc`
- Enforce single quotes (`singleQuote: true`)
- End-of-line mode: `endOfLine: auto`
- Ignore list in `.prettierignore` (`build`, `coverage`)

### ESLint

- Uses flat config (`eslint.config.js`)
- Extends/recommended sets include:
- `@eslint/js`
- `typescript-eslint`
- `eslint-plugin-react-hooks`
- `eslint-plugin-react-refresh`
- `eslint-config-prettier`
- Global ignore: `dist`

### TypeScript Compiler Expectations

- `strict: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noFallthroughCasesInSwitch: true`
- `noUncheckedSideEffectImports: true`
- `moduleResolution: bundler`
- `jsx: react-jsx`
- `noEmit: true`

## Import Conventions

- Prefer `@/` alias for shared cross-folder imports.
- Use relative imports for nearby local modules.
- Keep imports grouped in this order:
- 1. third-party packages
- 2. internal modules
- 3. side-effect imports (for example CSS)
- Prefer `import type` for type-only symbols.
- Avoid duplicate imports and import-order churn.

## Naming Conventions

- React components: `PascalCase` (example `MessageBubble`)
- Component files: `PascalCase.tsx`
- Functions and variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Utility files: concise lowercase/lower camel (example `utils.ts`)
- Avoid one-letter variable names except trivial loops.

## React / UI Conventions

- Use function components with typed props.
- Keep branching/rendering logic readable; extract helpers when needed.
- Return `null` explicitly for intentional no-render cases.
- Prefer composition over deeply nested conditional JSX.
- Keep Tailwind class lists intentional and consistent.
- Reuse `components/ui/*` primitives before creating new base controls.

## Error Handling Conventions

- Do not swallow exceptions.
- Handle network/async failure paths explicitly.
- Surface user-safe messages in UI for recoverable failures.
- Include operation context in errors (what failed).
- Validate external/tool inputs with schemas (Zod is already used).
- Prefer predictable structured return objects from tools.

## Agent Workflow

- Before finishing code changes, run:
- `npm run lint`
- `npm run build`
- If verification cannot run, state exactly why and what is pending.
- Keep changes minimal and relevant to the task.
- Do not refactor unrelated files.
- Do not add dependencies unless task requirements justify it.
- Preserve ESM behavior and alias compatibility.

## Cursor / Copilot Rule Files

- Checked `.cursor/rules/`
- Checked `.cursorrules`
- Checked `.github/copilot-instructions.md`
- Current result: none of these files exist in this repo.
- If these files are added later, treat them as higher-priority instructions and update this document.

## Quick Do / Don't

- Do keep type boundaries explicit.
- Do use `import type` whenever possible.
- Do run lint/build after meaningful edits.
- Do keep UI concerns separate from agent/business logic.
- Don't claim tests passed without runnable tests.
- Don't ignore lint/type errors without explanation.
- Don't mix unrelated formatting styles in touched files.
- Don't introduce breaking behavior without documenting impact.
