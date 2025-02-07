//backend\src\routes\characterRoutes.js
const express = require("express");
const { db } = require("../database");
const authenticateToken = require("../middleware/authMiddleware");
const { 
  getCharacterById,
  calculateUpgradeCost, 
  upgradeCharacterAttribute , 
  regenerateHealth, 
  addExperience,
} = require("../services/characterService");
const { 
  validateAttributeExist,
} = require("../utils/validationUtils");
const router = express.Router();



/**
 * Crear un nuevo personaje
 */
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { name, faction, class: characterClass } = req.body;
    const user_id = req.user.id;

    if (!name || !faction || !characterClass) {
      return res.status(400).json({ error: "Todos los campos son obligatorios." });
    }

    const existingCharacter = await db.all("SELECT * FROM characters WHERE user_id = ?", [user_id]);  
    if (!existingCharacter || Object.keys(existingCharacter).length === 0) {
      
    } else {
      return res.status(400).json({ error: "Ya tienes un personaje creado." });
    }

    const result = await db.run(
      `INSERT INTO characters (user_id, name, faction, class) VALUES (?, ?, ?, ?)`,
      [user_id, name, faction, characterClass]
    );

    res.status(201).json({
      id: result.lastID,
      name,
      faction,
      class: characterClass,
      level: 1,
      experience: 0,
    });
  } catch (error) {
    console.error("Error al crear personaje:", error);
    res.status(500).json({ error: "Error interno al crear el personaje." });
  }
});

/**
 * Obtener el personaje del usuario autenticado
 */
router.get("/", authenticateToken, async (req, res) => {
  try {
    db.all("SELECT * FROM characters WHERE user_id = ?", [req.user.id], (err, rows) => {
      if (err) {
        console.error("❌ Error en la consulta SQL:", err);
        return res.status(500).json({ error: "Error interno en la base de datos." });
      }

      if (!rows || rows.length === 0) {
        console.warn("⚠️ No se encontró un personaje para este usuario.");
        return res.status(404).json({ error: "No se encontró un personaje para este usuario." });
      }

      res.json(rows[0]); // Devolver el primer personaje encontrado
    });

  } catch (error) {
    console.error("❌ Error al obtener personaje:", error);
    res.status(500).json({ error: "Error interno al recuperar el personaje." });
  }
});

router.get("/attributes/upgrade-cost/:attribute", authenticateToken, async (req, res) => {
  try {
    const { attribute } = req.params;
    const character = await getCharacterById(req.user.id);

    if (!validateAttributeExist(attribute).success) 
    return res.status(400).json({ error: validateAttributeExist(attribute).error });
  
    if (!character) 
    return res.status(404).json({ error: "Personaje no encontrado." });
    
    if (!(attribute in character))
    return res.status(400).json({ error: `El atributo '${attribute}' no existe en el personaje.` });
    
    const cost = calculateUpgradeCost(character[attribute]);

    res.json({ attribute, cost });
  } catch (error) {
    console.error("❌ Error al obtener el costo de mejora:", error);
    res.status(500).json({ error: "Error interno al calcular el costo de mejora." });
  }
});

router.post("/attributes/upgrade-attribute", authenticateToken, async (req, res) => {
  try {
    console.log(req.body);

    const { attribute } = req.body;
    const character = await getCharacterById(req.user.id);
    console.log("1");
    if (!validateAttributeExist(attribute).success) 
    return res.status(400).json({ error: validateAttributeExist(attribute).error });

    if (!character) 
    return res.status(404).json({ error: "Personaje no encontrado." });
    
    if (!(attribute in character))
    return res.status(400).json({ error: `El atributo '${attribute}' no existe en el personaje.` });
    
    const cost = calculateUpgradeCost(character[attribute]);

    if (character.currentXp < cost) {
      return res.status(400).json({ error: "No tienes suficiente experiencia para mejorar este atributo." });
    }

    const upgradeResult = await upgradeCharacterAttribute(req.user.id, character, attribute, cost);
    console.log("✅ Mejora exitosa:", upgradeResult);

    return res.json({
      message: `Has mejorado ${attribute} a ${character[attribute]+1}.`,
    });
  } catch (error) {
    console.error("Error en la mejora de atributo:", error);
    return res.status(500).json({ error: "Error interno al mejorar el atributo." });
  }
});

/**
 * Añadir experiencia al personaje
 */
router.post("/add-xp", authenticateToken, async (req, res) => {
  try {
    const { xp } = req.body;
    if (!xp || xp <= 0) {
      return res.status(400).json({ error: "La experiencia debe ser un número positivo." });
    }

    addExperience(req.user.id, xp, res);
  } catch (error) {
    console.error("Error al añadir experiencia:", error);
    res.status(500).json({ error: "Error interno al añadir experiencia." });
  }
});

/**
 * Obtener el ranking de los mejores jugadores
 */
router.get("/leaderboard", async (req, res) => {
  try {
    const leaderboard = await db.all(
      `SELECT name, level, totalXp, totalGold FROM characters ORDER BY totalXp DESC LIMIT 10`
    );

    res.json({ leaderboard });
  } catch (error) {
    console.error("Error al obtener ranking:", error);
    res.status(500).json({ error: "Error interno al obtener el ranking." });
  }
});

/**
 * Regenerar salud del personaje
 */
router.get("/regenerate-health", authenticateToken, async (req, res) => {
  try {
    regenerateHealth(req.user.id, res);
  } catch (error) {
    console.error("Error al regenerar salud:", error);
    res.status(500).json({ error: "Error interno al regenerar salud." });
  }
});

/**
 * Listar inventario del personaje
 */
router.get("/inventory", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    const character = await db.get("SELECT * FROM characters WHERE user_id = ?", [user_id]);
    if (!character) return res.status(404).json({ error: "Personaje no encontrado." });

    const inventory = await db.all(
      `SELECT i.* FROM character_items ci
      JOIN items i ON ci.item_id = i.id
      WHERE ci.character_id = ?`,
      [character.id]
    );

    res.json({ inventory });
  } catch (error) {
    console.error("Error al obtener inventario:", error);
    res.status(500).json({ error: "Error interno al obtener el inventario." });
  }
});

/**
 * Equipar o desequipar un ítem
 */
router.post("/inventory/equip", authenticateToken, async (req, res) => {
  try {
    const { item_id, equip } = req.body;
    if (!item_id || typeof equip !== "boolean") {
      return res.status(400).json({ error: "item_id y equip (true o false) son obligatorios." });
    }

    const user_id = req.user.id;
    const character = await db.get("SELECT * FROM characters WHERE user_id = ?", [user_id]);
    if (!character) return res.status(404).json({ error: "Personaje no encontrado." });

    const itemInInventory = await db.get(
      "SELECT * FROM character_items WHERE character_id = ? AND item_id = ?",
      [character.id, item_id]
    );

    if (!itemInInventory) return res.status(400).json({ error: "No posees este ítem." });

    await db.run("UPDATE character_items SET equipped = ? WHERE id = ?", [equip ? 1 : 0, itemInInventory.id]);
    res.json({ message: equip ? "Ítem equipado" : "Ítem desequipado" });
  } catch (error) {
    console.error("Error al equipar/desequipar ítem:", error);
    res.status(500).json({ error: "Error interno al cambiar el estado del ítem." });
  }
});


module.exports = router;
