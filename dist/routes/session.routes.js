"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const history_1 = require("../services/history");
const r = (0, express_1.Router)();
r.get('/:id', async (req, res) => {
    const hist = await (0, history_1.getHistory)(req.params.id);
    res.json({ history: hist });
});
r.delete('/:id', async (req, res) => {
    await (0, history_1.clearHistory)(req.params.id);
    res.json({ ok: true });
});
exports.default = r;
