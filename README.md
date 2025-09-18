# RAG News Chatbot — Full Stack (Single-Command Dev)
This repo contains a complete, runnable example of a RAG chatbot over ~50 news articles.

## Quickstart
```bash
docker compose up -d qdrant redis

# Ingest news into Qdrant
cd backend
python -m pip install -r requirements.txt
python scripts/ingest_news.py

# Start API
npm install
npm run dev

# Frontend
cd ../frontend
npm install
npm run dev
```
# Demo video link
https://www.dropbox.com/scl/fi/j6nx1jnmqu80g7m1zzv7b/Screen-Recording-2025-09-17-032129.mp4?rlkey=o6fq6r2s39sqepbwzl2qvtk4k&st=icmosnoa&dl=0
