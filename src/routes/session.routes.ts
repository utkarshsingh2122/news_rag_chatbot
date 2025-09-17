import { Router } from 'express';
import { getHistory, clearHistory } from '../services/history';

const r = Router();

r.get('/:id', async (req, res) => {
  const hist = await getHistory(req.params.id);
  res.json({ history: hist });
});

r.delete('/:id', async (req, res) => {
  await clearHistory(req.params.id);
  res.json({ ok: true });
});

export default r;
