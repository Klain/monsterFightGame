"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCharacterMiddleware = void 0;
const characterService_1 = __importDefault(require("../services/characterService"));
const validateCharacterMiddleware = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: "Usuario no autenticado." });
            return;
        }
        const character = await characterService_1.default.getCharacterById(userId);
        if (!character) {
            res.status(404).json({ error: "Personaje no encontrado para este usuario." });
            return;
        }
        req.character = character;
        next();
    }
    catch (error) {
        console.error("❌ Error al validar el personaje:", error);
        res.status(500).json({ error: "Error interno al validar el personaje." });
    }
};
exports.validateCharacterMiddleware = validateCharacterMiddleware;
