import 'dotenv/config';

export const cfg = {
  port: Number(process.env.PORT || 8080),
  corsOrigin: process.env.CORS_ORIGIN || '*',
  qdrantUrl: process.env.QDRANT_URL!,
  qdrantApiKey: process.env.QDRANT_API_KEY,
  collection: process.env.COLLECTION_NAME || 'news_chunks_demo',
  topK: Number(process.env.TOP_K || 5),
  jinaKey: process.env.JINA_API_KEY!,
  jinaModel: process.env.JINA_EMBED_MODEL || 'jina-embeddings-v3',
  geminiKey: process.env.GEMINI_API_KEY!,
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379'
};
