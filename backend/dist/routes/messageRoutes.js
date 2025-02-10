"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const messageService_1 = require("../services/messageService");
const router = express_1.default.Router();
// Ruta: Enviar mensaje
router.post("/send", authMiddleware_1.default, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Usuario no autenticado." });
            return;
        }
        const { receiver_id, subject, body } = req.body;
        if (!receiver_id || !subject || !body) {
            res.status(400).json({ error: "receiver_id, subject y body son obligatorios." });
            return;
        }
        const result = await (0, messageService_1.sendMessage)(req.user.id, receiver_id, subject, body);
        res.json(result);
    }
    catch (error) {
        console.error("Error al enviar mensaje:", error);
        res.status(500).json({ error: "Error interno al enviar mensaje." });
    }
});
// Ruta: Obtener mensajes
router.get("/", authMiddleware_1.default, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Usuario no autenticado." });
            return;
        }
        const messages = await (0, messageService_1.getMessages)(req.user.id);
        res.json({ messages });
    }
    catch (error) {
        console.error("Error al obtener mensajes:", error);
        res.status(500).json({ error: "Error interno al obtener mensajes." });
    }
});
// Ruta: Marcar mensaje como leído
router.post("/read/:message_id", authMiddleware_1.default, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Usuario no autenticado." });
            return;
        }
        const { message_id } = req.params;
        if (!message_id) {
            res.status(400).json({ error: "El ID del mensaje es obligatorio." });
            return;
        }
        const result = await (0, messageService_1.markMessageAsRead)(Number(message_id));
        res.json(result);
    }
    catch (error) {
        console.error("Error al marcar mensaje como leído:", error);
        res.status(500).json({ error: "Error interno al marcar mensaje como leído." });
    }
});
exports.default = router;
