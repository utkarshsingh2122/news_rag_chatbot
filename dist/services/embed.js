"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.embedTexts = embedTexts;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config");
async function embedTexts(texts) {
    const { data } = await axios_1.default.post('https://api.jina.ai/v1/embeddings', {
        model: config_1.cfg.jinaModel, input: texts
    }, { headers: { Authorization: `Bearer ${config_1.cfg.jinaKey}` } });
    return data.data.map((d) => d.embedding);
}
