// backend/src/routes/debugRoutes.js
const express = require("express");
const { modifyCharacterField, getCharacterById } = require("../services/debugService");
const router = express.Router();

/**
 * 📌 Obtener un personaje por ID.
 */
router.get("/character/:id", async (req, res) => {
  try {
    const character = await getCharacterById(req.params.id);
    if (!character) {
      return res.status(404).json({ error: "Personaje no encontrado" });
    }
    res.json(character);
  } catch (error) {
    console.error("❌ Error en /character/:id:", error);
    res.status(500).json({ error: "Error interno al obtener el personaje." });
  }
});

/**
 * 📌 Modificar un atributo específico de un personaje.
 */
router.post("/character/modify", async (req, res) => {
  try {
    const { characterId, field, value } = req.body;
    
    // Validaciones básicas
    if (!characterId || !field || value === undefined) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    const allowedFields = ["health", "attack", "defense", "currentGold", "totalGold", "currentXp", "totalXp", "upgrade_points"];
    if (!allowedFields.includes(field)) {
      return res.status(400).json({ error: `Campo inválido. Solo se permiten: ${allowedFields.join(", ")}` });
    }

    const result = await modifyCharacterField(characterId, field, value);
    res.json(result);
  } catch (error) {
    console.error("❌ Error en /character/modify:", error);
    res.status(500).json({ error: "Error interno al modificar el personaje." });
  }
});

module.exports = router;
