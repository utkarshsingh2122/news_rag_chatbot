# RAG News Frontend (React + Vite + SCSS)

A minimal chat UI for the RAG news bot.

## Run
```bash
cp .env.example .env
pnpm i   # or npm i / yarn
pnpm dev # opens on http://localhost:5173
```

Configure:
- `VITE_API_BASE` → backend base URL
- `VITE_WS_URL` → backend ws URL (optional; REST works fine)

## Features
- Shows session history on load
- Typed/stream-like bot responses
- Reset session button
- Source links per answer

## Build
```bash
pnpm build && pnpm preview
```
