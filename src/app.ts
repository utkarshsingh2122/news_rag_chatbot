import express from 'express';
import cors from 'cors';
import http from 'http';
import { cfg } from './config';
import chatRoutes from './routes/chat.routes';
import sessionRoutes from './routes/session.routes';
import { attachWS } from './ws';

const app = express();
app.use(cors({ origin: cfg.corsOrigin }));
app.use(express.json());

app.get('/health', (_, res) => res.json({ ok: true }));
app.use('/chat', chatRoutes);
app.use('/sessions', sessionRoutes);

const server = http.createServer(app);
attachWS(server);

server.listen(cfg.port, () => console.log(`API on :${cfg.port}`));
