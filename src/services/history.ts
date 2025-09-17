import Redis from 'ioredis';
import { cfg } from '../config';

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  ts: number;
};

const redis = new Redis(cfg.redisUrl);
const TTL_SECONDS = 60 * 60 * 12; // 12h

export async function appendMsg(
  sessionId: string,
  role: ChatMessage['role'],
  content: string
) {
  const key = `sess:${sessionId}`;
  const msg: ChatMessage = { role, content, ts: Date.now() };
  await redis.rpush(key, JSON.stringify(msg));
  await redis.expire(key, TTL_SECONDS);
}

export async function getHistory(sessionId: string): Promise<ChatMessage[]> {
  const key = `sess:${sessionId}`;
  const arr = await redis.lrange(key, 0, -1);
  // TS-safe parse:
  return arr.map((s) => JSON.parse(s) as ChatMessage);
}

export async function clearHistory(sessionId: string) {
  const key = `sess:${sessionId}`;
  await redis.del(key);
}
