const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const { addExperience,addUpgradePoints, upgradeAttribute, regenerateHealth, buyHealing } = require("../services/characterService");

const router = express.Router();

// Verifica si estamos en modo desarrollo
const isDebugMode = process.env.NODE_ENV === "development";

// Middleware para bloquear en producción
router.use((req, res, next) => {
  if (!isDebugMode) {
    return res.status(403).json({ error: "Este endpoint no está disponible en producción." });
  }
  next();
});

/**
 * Gana XP (Debug)
 */
router.post("/add-xp", authenticateToken, async (req, res) => {
  try {
    const { xp } = req.body;
    if (!xp || xp <= 0) {
      return res.status(400).json({ error: "La experiencia debe ser un número positivo." });
    }
    addExperience(req.user.id, xp, res);
  } catch (error) {
    res.status(500).json({ error: "Error interno al añadir experiencia." });
  }
});


router.post("/add-upgrade-points", authenticateToken, async (req, res) => {
  try {
    const { points } = req.body;
    if (!points || points <= 0) {
      return res.status(400).json({ error: "Debes especificar una cantidad válida de puntos de mejora." });
    }
    addUpgradePoints(req.user.id, points, res);
  } catch (error) {
    console.error("❌ Error en el endpoint de añadir puntos de mejora:", error);
    res.status(500).json({ error: "Error interno al procesar la solicitud." });
  }
});

/**
 * Mejorar atributo (Debug)
 */
router.post("/upgrade-attribute", authenticateToken, async (req, res) => {
  try {
    const { attribute } = req.body;
    if (!attribute) {
      return res.status(400).json({ error: "Debes especificar un atributo para mejorar." });
    }
    upgradeAttribute(req.user.id, attribute, res);
  } catch (error) {
    res.status(500).json({ error: "Error interno al mejorar atributo." });
  }
});

/**
 * Regenerar salud (Debug)
 */
router.get("/regenerate-health", authenticateToken, async (req, res) => {
  try {
    regenerateHealth(req.user.id, res);
  } catch (error) {
    res.status(500).json({ error: "Error interno al regenerar salud." });
  }
});

/**
 * Comprar sanación con oro (Debug)
 */
router.post("/buy-healing", authenticateToken, async (req, res) => {
  try {
    buyHealing(req.user.id, res);
  } catch (error) {
    res.status(500).json({ error: "Error interno al comprar sanación." });
  }
});

module.exports = router;
