import { QdrantClient } from '@qdrant/js-client-rest';
import { cfg } from '../config';
import { embedTexts } from './embed';

const client = new QdrantClient({ url: cfg.qdrantUrl, apiKey: cfg.qdrantApiKey });

export async function retrievePassages(query: string, topK = cfg.topK) {
  const [qvec] = await embedTexts([query]);
  const res = await client.search(cfg.collection, {
    vector: qvec,
    limit: topK,
    with_payload: true
  });
  return res;
}
