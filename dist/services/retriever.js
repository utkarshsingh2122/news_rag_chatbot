"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrievePassages = retrievePassages;
const js_client_rest_1 = require("@qdrant/js-client-rest");
const config_1 = require("../config");
const embed_1 = require("./embed");
const client = new js_client_rest_1.QdrantClient({ url: config_1.cfg.qdrantUrl, apiKey: config_1.cfg.qdrantApiKey });
async function retrievePassages(query, topK = config_1.cfg.topK) {
    const [qvec] = await (0, embed_1.embedTexts)([query]);
    const res = await client.search(config_1.cfg.collection, {
        vector: qvec,
        limit: topK,
        with_payload: true
    });
    return res;
}
