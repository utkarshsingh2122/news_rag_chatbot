import { Router } from 'express';
import { retrievePassages } from '../services/retriever';
import { askGemini, buildRagPrompt } from '../services/llm';
import { appendMsg } from '../services/history';

const r = Router();

r.post('/', async (req, res) => {
  const { sessionId, message } = req.body as { sessionId: string; message: string };
  if (!sessionId || !message) return res.status(400).json({ error: 'sessionId and message required' });

  await appendMsg(sessionId, 'user', message);

  const hits = await retrievePassages(message);
  const prompt = buildRagPrompt(message, hits);
  const answer = await askGemini(prompt);

  await appendMsg(sessionId, 'assistant', answer);

  res.json({
    answer,
    sources: hits.map((h: any, i: number) => ({
      idx: i + 1,
      title: h.payload.title,
      url: h.payload.url,
      score: h.score
    }))
  });
});

export default r;
