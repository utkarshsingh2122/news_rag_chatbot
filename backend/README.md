# RAG News Backend (Node + Express)

An Express API that powers a Retrieval‑Augmented Generation chatbot over a small news corpus.

## Features
- REST: `POST /chat`, `GET /sessions/:id`, `DELETE /sessions/:id`
- WebSocket: `chat` in, `bot` out
- RAG: Jina embeddings + Qdrant semantic search → Gemini
- Redis: per‑session chat history with TTL (12h)

## Quick start
```bash
cp .env.example .env
# Fill JINA_API_KEY and GEMINI_API_KEY. Adjust QDRANT_URL/REDIS_URL if needed.

pnpm i   # or npm i / yarn
pnpm dev # starts API on PORT (default 8080)
```

### Health check
`GET /health` → `{ ok: true }`

## Ingest ~50 news articles into Qdrant
There is a Python helper that fetches RSS, extracts full text, chunks, embeds with Jina, and upserts to Qdrant.

> Requires Python 3.10+
```bash
cd scripts
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt  # created below
cp ../.env.example ../.env       # ensure QDRANT_* and JINA_* are set
python ingest_news.py
```

This will create (or reuse) the `COLLECTION_NAME` and populate chunks with payload:
```json
{ "title": "...", "url": "...", "text": "...", "publishedAt": "ISO8601" }
```

### `scripts/requirements.txt`
```
feedparser
trafilatura
python-dotenv
qdrant-client
tqdm
requests
```

## Redis caching, TTLs, and performance
- Every user gets a **sessionId** (client‑generated UUID).
- Each chat turn is appended to `sess:<sessionId>` (Redis list).
- TTL is **12 hours** (see `services/history.ts`), refreshed on each append.
- To tune TTL, change `TTL_SECONDS` or set via env and read in `history.ts`.

**Cache warming ideas** (documented, optional to implement):
- On deploy, pre‑run `ingest_news.py`.
- Periodically refresh the top 50 trending article URLs.
- Pre‑embed FAQ prompts and prime relevant chunks in a small LRU.

## Design decisions
- **Qdrant** over Pinecone for simple local/dev setup + free tier cloud.
- **Jina embeddings v3** for strong multilingual support and generous free tier.
- **Gemini 1.5 Flash** for speed & cost during demo.
- **Redis** for ephemeral history; SQL persistence is optional.

## Env
See `.env.example`. Keys:
- `QDRANT_URL`, `QDRANT_API_KEY`, `COLLECTION_NAME`, `TOP_K`
- `JINA_API_KEY`, `JINA_EMBED_MODEL`
- `GEMINI_API_KEY`
- `REDIS_URL`
- `PORT`, `CORS_ORIGIN`

## Build & run
```bash
pnpm build && pnpm start
```

## Deploy (Render example)
- Create a **Web Service** with Docker or Node build.
- Add env vars (same as `.env`).
- Expose the port in `PORT`.

