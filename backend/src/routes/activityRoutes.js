//backend\src\routes\activityRoutes.js

const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const {
    startActivity,
    getActivityStatus,
    claimActivityReward,
    startHealing,
    claimHealing
} = require("../services/activityService");

const router = express.Router();

/**
 * Iniciar una actividad (ejemplo: "Trabajo en la cantera", "Entrenamiento")
 */
router.post("/start", authenticateToken, (req, res) => {
    try {
        const { character_id, type } = req.body;

        if (!character_id || !type) {
            return res.status(400).json({ error: "character_id y type son obligatorios." });
        }

        const activityTypes = {
            "trabajo": { duration: 60, reward_xp: 100, reward_gold: 50 }, // 1 hora
            "entrenamiento": { duration: 30, reward_xp: 150, reward_gold: 20 }, // 30 min
        };

        if (!activityTypes[type]) {
            return res.status(400).json({ error: "Tipo de actividad no válido." });
        }

        const { duration, reward_xp, reward_gold } = activityTypes[type];

        startActivity(req.user.id, character_id, type, duration, reward_xp, reward_gold, res);
    } catch (error) {
        console.error("Error al iniciar actividad:", error);
        res.status(500).json({ error: "Error interno al iniciar la actividad." });
    }
});

/**
 * Consultar el estado de la actividad en curso
 */
router.get("/status/:character_id", authenticateToken, (req, res) => {
    try {
        if (!req.params.character_id) {
            return res.status(400).json({ error: "El ID del personaje es obligatorio." });
        }

        getActivityStatus(req.params.character_id, res);
    } catch (error) {
        console.error("Error al obtener estado de la actividad:", error);
        res.status(500).json({ error: "Error interno al consultar la actividad." });
    }
});

/**
 * Reclamar recompensa tras completar la actividad
 */
router.post("/claim/:character_id", authenticateToken, (req, res) => {
    try {
        if (!req.params.character_id) {
            return res.status(400).json({ error: "El ID del personaje es obligatorio." });
        }

        claimActivityReward(req.params.character_id, res);
    } catch (error) {
        console.error("Error al reclamar recompensa de la actividad:", error);
        res.status(500).json({ error: "Error interno al reclamar la recompensa." });
    }
});

/**
 * Iniciar una sanación
 */
router.post("/healing/start", authenticateToken, (req, res) => {
    try {
        const { character_id, healingTime } = req.body;

        if (!character_id || !healingTime) {
            return res.status(400).json({ error: "character_id y healingTime son obligatorios." });
        }

        if (healingTime <= 0) {
            return res.status(400).json({ error: "El tiempo de sanación debe ser mayor a 0." });
        }

        startHealing(req.user.id, character_id, healingTime, res);
    } catch (error) {
        console.error("Error al iniciar sanación:", error);
        res.status(500).json({ error: "Error interno al iniciar la sanación." });
    }
});

/**
 * Reclamar sanación completada
 */
router.post("/healing/claim/:character_id", authenticateToken, (req, res) => {
    try {
        if (!req.params.character_id) {
            return res.status(400).json({ error: "El ID del personaje es obligatorio." });
        }

        claimHealing(req.params.character_id, res);
    } catch (error) {
        console.error("Error al reclamar sanación:", error);
        res.status(500).json({ error: "Error interno al reclamar la sanación." });
    }
});

module.exports = router;
