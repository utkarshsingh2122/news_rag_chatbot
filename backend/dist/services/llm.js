"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.askGemini = askGemini;
exports.buildRagPrompt = buildRagPrompt;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config");
async function askGemini(prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config_1.cfg.geminiKey}`;
    const body = { contents: [{ parts: [{ text: prompt }] }] };
    const { data } = await axios_1.default.post(url, body);
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return text;
}
function buildRagPrompt(userQ, contexts) {
    const ctx = contexts.map((c, i) => `[#${i + 1} | ${c.payload.title} | ${c.payload.url}]
${c.payload.text}`).join('\n\n');
    return `You are a helpful assistant answering questions about recent news.
Answer concisely using only the CONTEXT. If insufficient context, say so.

QUESTION:
${userQ}

CONTEXT:
${ctx}

Format: bullet points + short summary. Include sources as [#idx].`;
}
