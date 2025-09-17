"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const retriever_1 = require("../services/retriever");
const llm_1 = require("../services/llm");
const history_1 = require("../services/history");
const r = (0, express_1.Router)();
r.post('/', async (req, res) => {
    const { sessionId, message } = req.body;
    if (!sessionId || !message)
        return res.status(400).json({ error: 'sessionId and message required' });
    await (0, history_1.appendMsg)(sessionId, 'user', message);
    const hits = await (0, retriever_1.retrievePassages)(message);
    const prompt = (0, llm_1.buildRagPrompt)(message, hits);
    const answer = await (0, llm_1.askGemini)(prompt);
    await (0, history_1.appendMsg)(sessionId, 'assistant', answer);
    res.json({
        answer,
        sources: hits.map((h, i) => ({
            idx: i + 1,
            title: h.payload.title,
            url: h.payload.url,
            score: h.score
        }))
    });
});
exports.default = r;
