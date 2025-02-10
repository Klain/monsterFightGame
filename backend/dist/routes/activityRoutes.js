"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const activityService_1 = __importDefault(require("../services/activityService"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const validateCharacterMiddleware_1 = require("../middleware/validateCharacterMiddleware");
const validateActivityMiddleware_1 = require("../middleware/validateActivityMiddleware");
const validateActivityStartMiddleware_1 = require("../middleware/validateActivityStartMiddleware");
const router = express_1.default.Router();
//Obtener duración máxima permitida para una actividad
router.get("/max-duration/:activity", authMiddleware_1.default, validateCharacterMiddleware_1.validateCharacterMiddleware, validateActivityMiddleware_1.validateActivityMiddleware, async (req, res) => {
    try {
        const activityType = req.locals.activityType;
        const character = req.locals.character;
        let maxDuration = 1;
        if (activityType === "explorar") {
            maxDuration = character.currentStamina;
        }
        else if (activityType === "sanar") {
            maxDuration = character.currentHealth < character.totalHealth ? 60 : 0;
        }
        else if (activityType === "meditar") {
            maxDuration = character.currentMana < character.totalMana ? 60 : 0;
        }
        res.json({ activity: activityType, maxDuration });
    }
    catch (error) {
        console.error("Error al obtener duración máxima:", error);
        res.status(500).json({ error: "Error interno." });
    }
});
// Ruta: Iniciar actividad
router.post("/start", authMiddleware_1.default, validateCharacterMiddleware_1.validateCharacterMiddleware, validateActivityMiddleware_1.validateActivityMiddleware, validateActivityStartMiddleware_1.validateActivityStartMiddleware, async (req, res) => {
    try {
        const character = req.locals.character;
        const activityType = req.locals.activityType;
        const { duration } = req.body;
        await activityService_1.default.startActivity(character, activityType, duration);
        res.json({ message: "Actividad iniciada correctamente." });
    }
    catch (error) {
        console.error("Error al iniciar actividad:", error);
        res.status(500).json({ error: "Error interno." });
    }
});
//Consultar estado de actividad
router.get("/status", authMiddleware_1.default, validateCharacterMiddleware_1.validateCharacterMiddleware, async (req, res) => {
    try {
        const character = req.locals.character;
        const status = await activityService_1.default.getActivityStatus(character);
        res.json(status);
    }
    catch (error) {
        console.error("Error al obtener estado de la actividad:", error);
        res.status(500).json({ error: "Error interno." });
    }
});
//Reclamar recompensa de actividad
router.post("/claim", authMiddleware_1.default, validateCharacterMiddleware_1.validateCharacterMiddleware, async (req, res) => {
    try {
        const character = req.locals.character;
        const updatedCharacter = await activityService_1.default.claimActivityReward(character);
        res.json(updatedCharacter);
    }
    catch (error) {
        console.error("Error al reclamar recompensa:", error);
        res.status(500).json({ error: "Error interno." });
    }
});
exports.default = router;
