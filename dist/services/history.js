"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appendMsg = appendMsg;
exports.getHistory = getHistory;
exports.clearHistory = clearHistory;
const ioredis_1 = __importDefault(require("ioredis"));
const config_1 = require("../config");
const redis = new ioredis_1.default(config_1.cfg.redisUrl);
const TTL_SECONDS = 60 * 60 * 12; // 12h
async function appendMsg(sessionId, role, content) {
    const key = `sess:${sessionId}`;
    const msg = { role, content, ts: Date.now() };
    await redis.rpush(key, JSON.stringify(msg));
    await redis.expire(key, TTL_SECONDS);
}
async function getHistory(sessionId) {
    const key = `sess:${sessionId}`;
    const arr = await redis.lrange(key, 0, -1);
    // TS-safe parse:
    return arr.map((s) => JSON.parse(s));
}
async function clearHistory(sessionId) {
    const key = `sess:${sessionId}`;
    await redis.del(key);
}
