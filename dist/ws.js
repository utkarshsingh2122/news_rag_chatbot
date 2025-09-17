"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachWS = attachWS;
const socket_io_1 = require("socket.io");
const retriever_1 = require("./services/retriever");
const llm_1 = require("./services/llm");
const history_1 = require("./services/history");
function attachWS(httpServer) {
    const io = new socket_io_1.Server(httpServer, { cors: { origin: '*' } });
    io.on('connection', (socket) => {
        socket.on('chat', async ({ sessionId, message }) => {
            await (0, history_1.appendMsg)(sessionId, 'user', message);
            const hits = await (0, retriever_1.retrievePassages)(message);
            const prompt = (0, llm_1.buildRagPrompt)(message, hits);
            const answer = await (0, llm_1.askGemini)(prompt);
            await (0, history_1.appendMsg)(sessionId, 'assistant', answer);
            socket.emit('bot', {
                answer,
                sources: hits.map((h, i) => ({
                    idx: i + 1,
                    title: h.payload.title,
                    url: h.payload.url,
                    score: h.score
                }))
            });
        });
    });
}
