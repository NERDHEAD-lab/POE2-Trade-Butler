# AGENTS.md - POE2-Trade-Butler

Chrome Extension for POE2 Trade with popup, content script, background worker,
sidebar/history UI, and generated locale/storage helpers.

This file is the Codex entry point for project rules.

## Project Context

- Before code changes, use `.agents/skills/poe2-trade-butler-development/SKILL.md`
  for the project structure map and task-specific hotspots.
- `src/manifest.json` is copied into `dist/` by `webpack.config.js`.
- `webpack.config.js` injects `manifest.key` only in development builds when
  `dev_key.pem` or `dev_key.pub` exists at the repo root.
- `dev_key.pub` fixes the development Chrome extension ID. It is intentionally
  ignored by git.
- The current known development extension ID is
  `ipnemofnhodcgcplnnfekbfpmngeeocm`.

## Commands

- `npm install` - install dependencies.
- `npm run build:dev` - development build with dev manifest key injection.
- `npm run build` - lint, generate assets, production webpack build, zip.
- `npm test` - Jest tests.
- `npm run lint` / `npm run lint:dev` - ESLint.
- `npm run pre:build` - regenerate supported languages and storage initializer.

## GitHub CLI Token

The repo-local `.env` may contain `GH_TOKEN`. Never print `.env` or token
values; check only whether the key exists.

Before any repo-local `gh` command or GitHub HTTPS push, inject `GH_TOKEN` into
that child process. Do not run `gh auth login` or `gh auth switch` for repo work,
because those mutate global GitHub CLI auth state.

WSL bash:

```bash
GH_TOKEN="$(grep '^GH_TOKEN=' .env | cut -d= -f2- | tr -d '\r')" gh pr view
```

Windows PowerShell:

```powershell
$env:GH_TOKEN = (Get-Content .env | Where-Object { $_ -match '^GH_TOKEN=' } | Select-Object -First 1) -replace '^GH_TOKEN=', ''
gh pr view
Remove-Item Env:GH_TOKEN
```

## Local Environment Values

The repo-local `.env` may contain local-only values:

- `GH_TOKEN` for repo-local GitHub CLI or HTTPS push operations.

Do not commit `.env` or secrets.

Do not store the Chrome extension ID in `.env`. Development extension identity is
fixed by `dev_key.pub`: `webpack.config.js` injects its public key into
`dist/manifest.json` as `manifest.key` during `npm run build:dev`. The expected
development extension ID derived from that key is
`ipnemofnhodcgcplnnfekbfpmngeeocm`.

## WSL Execution Rules

Detect WSL at session start. If `uname -r` contains `microsoft` or `WSL`, this
is WSL.

WSL is the development primary for editing, git, focused source inspection, and
pure Node one-offs. Windows PowerShell is the package-script primary for this
repo because the checkout and `node_modules` are shared across Windows and WSL.

Split commands by where they belong:

- WSL bash, direct: source inspection, editing, `git status`, `git diff`,
  `git add`, branch inspection, and pure Node one-offs such as `node -e ...`.
- Windows PowerShell only: `npm install`, `npm ci`, `npm test`,
  `npm run build`, `npm run build:dev`, lint scripts, and `git commit` when
  hooks may execute npm-backed tooling.

Prefer `pwsh.exe` (PowerShell 7); fall back to `powershell.exe` (5.1) if absent:

```bash
command -v pwsh.exe >/dev/null && PS=pwsh.exe || PS=powershell.exe
"$PS" -NoProfile -Command "cd 'D:\project\POE2-Trade-Butler-origin'; npm run <script>"
"$PS" -NoProfile -Command "cd 'D:\project\POE2-Trade-Butler-origin'; git commit -m 'chore: describe change'"
```

Why `npm install` / `npm ci` must not run in WSL: WSL's npm can write POSIX
symlinks under `node_modules/.bin/` and install Linux optional native packages.
The next Windows `npm test` / `npm run build` can then fail with missing
wrappers or platform-specific native package errors.

If dependencies need reinstalling because of a lock conflict, native binding
error, broken `.bin` wrappers, or workspace symlink mismatch, ask the user to run
the install from Windows pwsh. Do not auto-repair from WSL.

## Kakao Games Domain Work

This repo still has legacy `poe.game.daum.net` handling in manifest permissions,
content script matches, API utilities, translation data URLs, and tests. The
current task is to migrate for Kakao Games' domain change without regressing
GGG/pathofexile regional hosts.

When changing domain behavior:

- Update `src/manifest.json` host permissions and content script matches.
- Update URL parsing and locale/service detection in `src/utils/`.
- Update translation/static data URLs in `src/support/`.
- Update fixtures and tests that assert Korean trade URLs.
- Run focused tests first, then the relevant package script through Windows
  PowerShell.

## Code Style

- State assumptions; ask when ambiguous.
- Minimum code that solves the problem. No speculative abstractions.
- Surgical edits: every changed line must trace to the task.
- Define a verifiable success check before declaring done.
