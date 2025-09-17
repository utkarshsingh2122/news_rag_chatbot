import { Server } from 'socket.io';
import { retrievePassages } from './services/retriever';
import { askGemini, buildRagPrompt } from './services/llm';
import { appendMsg } from './services/history';

export function attachWS(httpServer: any) {
  const io = new Server(httpServer, { cors: { origin: '*' } });

  io.on('connection', (socket) => {
    socket.on('chat', async ({ sessionId, message }) => {
      await appendMsg(sessionId, 'user', message);

      const hits = await retrievePassages(message);
      const prompt = buildRagPrompt(message, hits);
      const answer = await askGemini(prompt);

      await appendMsg(sessionId, 'assistant', answer);

      socket.emit('bot', {
        answer,
        sources: hits.map((h: any, i: number) => ({
          idx: i + 1,
          title: h.payload.title,
          url: h.payload.url,
          score: h.score
        }))
      });
    });
  });
}
