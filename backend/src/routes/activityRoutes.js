const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const { startActivity, getActivityStatus, claimActivityReward } = require("../services/activityService");
const { startHealing, claimHealing } = require("../services/activityService");

const router = express.Router();

// Iniciar una actividad (ejemplo: "Trabajo en la cantera")
router.post("/start", authenticateToken, (req, res) => {
    const { character_id, type } = req.body;

    const activityTypes = {
        "trabajo": { duration: 60, reward_xp: 100, reward_gold: 50 }, // 1 hora
        "entrenamiento": { duration: 30, reward_xp: 150, reward_gold: 20 }, // 30 min
    };

    if (!activityTypes[type]) {
        return res.status(400).json({ error: "Tipo de actividad no válido." });
    }

    const { duration, reward_xp, reward_gold } = activityTypes[type];

    startActivity(req.user.id, character_id, type, duration, reward_xp, reward_gold, res);
});

// Consultar el estado de la actividad en curso
router.get("/status/:character_id", authenticateToken, (req, res) => {
    getActivityStatus(req.params.character_id, res);
});

// Reclamar recompensa tras completar la actividad
router.post("/claim/:character_id", authenticateToken, (req, res) => {
    claimActivityReward(req.params.character_id, res);
});


// Iniciar una sanación
router.post("/healing/start", authenticateToken, (req, res) => {
    const { character_id, healingTime } = req.body;

    if (!healingTime || healingTime <= 0) {
        return res.status(400).json({ error: "El tiempo de sanación debe ser mayor a 0." });
    }

    startHealing(req.user.id, character_id, healingTime, res);
});

// Reclamar sanación completada
router.post("/healing/claim/:character_id", authenticateToken, (req, res) => {
    claimHealing(req.params.character_id, res);
});


module.exports = router;
