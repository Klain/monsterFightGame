"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const characterService_1 = __importDefault(require("../services/characterService"));
const activityService_1 = __importDefault(require("../services/activityService"));
const router = express_1.default.Router();
// Ruta: Iniciar actividad
router.post("/start", authMiddleware_1.default, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Usuario no autenticado." });
            return;
        }
        const { character_id, type } = req.body;
        if (!character_id || !type) {
            res.status(400).json({ error: "character_id y type son obligatorios." });
            return;
        }
        const activityTypes = {
            trabajo: { duration: 1, reward_xp: 100, reward_gold: 50 },
            entrenamiento: { duration: 1, reward_xp: 150, reward_gold: 20 },
        };
        if (!activityTypes[type]) {
            res.status(400).json({ error: "Tipo de actividad no válido." });
            return;
        }
        const { duration, reward_xp, reward_gold } = activityTypes[type];
        await activityService_1.default.startActivity(req.user.id, character_id, type, duration, reward_xp, reward_gold, res);
        res.json({ message: "Actividad iniciada exitosamente." });
    }
    catch (error) {
        console.error("Error al iniciar actividad:", error);
        res.status(500).json({ error: "Error interno al iniciar la actividad." });
    }
});
// Ruta: Estado de la actividad
router.get("/status", authMiddleware_1.default, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Usuario no autenticado." });
            return;
        }
        const character = await characterService_1.default.getCharacterById(req.user.id);
        if (!character) {
            res.status(404).json({ error: "Personaje no encontrado." });
            return;
        }
        const status = await activityService_1.default.getActivityStatus(character.id, res);
        res.json(status);
    }
    catch (error) {
        console.error("Error al obtener estado de la actividad:", error);
        res.status(500).json({ error: "Error interno al consultar la actividad." });
    }
});
// Ruta: Reclamar recompensa
router.post("/claim", authMiddleware_1.default, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Usuario no autenticado." });
            return;
        }
        const character = await characterService_1.default.getCharacterById(req.user.id);
        if (!character) {
            res.status(404).json({ error: "Personaje no encontrado." });
            return;
        }
        await activityService_1.default.claimActivityReward(character.id, res);
        const updatedCharacter = await characterService_1.default.getCharacterById(req.user.id);
        res.json(updatedCharacter);
    }
    catch (error) {
        console.error("Error al reclamar recompensa de la actividad:", error);
        res.status(500).json({ error: "Error interno al reclamar la recompensa." });
    }
});
router.post("/training/start", authMiddleware_1.default, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Usuario no autenticado." });
            return;
        }
        const { duration } = req.body;
        const character = await characterService_1.default.getCharacterById(req.user.id);
        if (!character) {
            res.status(404).json({ error: "Personaje no encontrado." });
            return;
        }
        if (!duration || duration <= 0) {
            res.status(400).json({ error: "El tiempo de entrenamiento debe ser mayor a 0." });
            return;
        }
        await activityService_1.default.startActivity(req.user.id, character.id, "train", duration, duration * 10, 0, res);
        res.json({ message: "Entrenamiento iniciado correctamente." });
    }
    catch (error) {
        console.error("Error al iniciar el entrenamiento:", error);
        res.status(500).json({ error: "Error interno al iniciar el entrenamiento." });
    }
});
router.post("/training/claim/:character_id", authMiddleware_1.default, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Usuario no autenticado." });
            return;
        }
        const { character_id } = req.params;
        if (!character_id) {
            res.status(400).json({ error: "El ID del personaje es obligatorio." });
            return;
        }
        await activityService_1.default.claimActivityReward(Number(character_id), res);
        res.json({ message: "Recompensa reclamada correctamente." });
    }
    catch (error) {
        console.error("Error al reclamar recompensa de entrenamiento:", error);
        res.status(500).json({ error: "Error interno al reclamar la recompensa." });
    }
});
exports.default = router;
