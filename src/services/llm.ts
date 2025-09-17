import axios from 'axios';
import { cfg } from '../config';

export async function askGemini(prompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyDETz6ph5rQwDFER0LVcHiZKEijBS3SzL4`;
  const body = { contents: [{ parts: [{ text: prompt }]}] };
  const { data } = await axios.post(url, body);
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return text;
}

export function buildRagPrompt(userQ: string, contexts: any[]) {
  const ctx = contexts.map((c: any, i: number) => `[#${i+1} | ${c.payload.title} | ${c.payload.url}]
${c.payload.text}`).join('\n\n');
  return `You are a helpful assistant answering questions about recent news.
Answer concisely using only the CONTEXT. If insufficient context, say so.

QUESTION:
${userQ}

CONTEXT:
${ctx}

Format: bullet points + short summary. Include sources as [#idx].`;
}
