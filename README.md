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
