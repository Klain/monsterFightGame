//backend\src\routes\debugRoutes.js
const express = require("express");
const db = require("../database");
const router = express.Router();

/**
 * Actualiza el nombre del personaje.
 */
router.post("/update/name", async (req, res) => {
    const { characterId, name } = req.body;
    if (!name) return res.status(400).json({ error: "El nombre no puede estar vacío." });
    await db.run("UPDATE characters SET name = ? WHERE id = ?", [name, characterId]);
    res.json({ message: "Nombre actualizado." });
});

/**
 * Actualiza la facción del personaje.
 */
router.post("/update/faction", async (req, res) => {
    const { characterId, faction } = req.body;
    if (!faction) return res.status(400).json({ error: "La facción no puede estar vacía." });
    await db.run("UPDATE characters SET faction = ? WHERE id = ?", [faction, characterId]);
    res.json({ message: "Facción actualizada." });
});

/**
 * Actualiza la clase del personaje.
 */
router.post("/update/class", async (req, res) => {
    const { characterId, characterClass } = req.body;
    if (!characterClass) return res.status(400).json({ error: "La clase no puede estar vacía." });
    await db.run("UPDATE characters SET class = ? WHERE id = ?", [characterClass, characterId]);
    res.json({ message: "Clase actualizada." });
});

/**
 * Actualiza el nivel del personaje.
 */
router.post("/update/level", async (req, res) => {
    const { characterId, level } = req.body;
    if (level < 1) return res.status(400).json({ error: "El nivel debe ser mayor a 0." });
    await db.run("UPDATE characters SET level = ? WHERE id = ?", [level, characterId]);
    res.json({ message: "Nivel actualizado." });
});

/**
 * Actualiza la experiencia actual del personaje.
 */
router.post("/update/currentXp", async (req, res) => {
    const { characterId, currentXp } = req.body;
    if (currentXp < 0) return res.status(400).json({ error: "La experiencia no puede ser negativa." });
    await db.run("UPDATE characters SET currentXp = ? WHERE id = ?", [currentXp, characterId]);
    res.json({ message: "Experiencia actualizada." });
});

/**
 * Actualiza la experiencia total del personaje.
 */
router.post("/update/totalXp", async (req, res) => {
    const { characterId, totalXp } = req.body;
    if (totalXp < 0) return res.status(400).json({ error: "La experiencia total no puede ser negativa." });
    await db.run("UPDATE characters SET totalXp = ? WHERE id = ?", [totalXp, characterId]);
    res.json({ message: "Experiencia total actualizada." });
});

/**
 * Actualiza el oro actual del personaje.
 */
router.post("/update/currentGold", async (req, res) => {
    const { characterId, currentGold } = req.body;
    if (currentGold < 0) return res.status(400).json({ error: "El oro no puede ser negativo." });
    await db.run("UPDATE characters SET currentGold = ? WHERE id = ?", [currentGold, characterId]);
    res.json({ message: "Oro actualizado." });
});

/**
 * Actualiza el oro total del personaje.
 */
router.post("/update/totalGold", async (req, res) => {
    const { characterId, totalGold } = req.body;
    if (totalGold < 0) return res.status(400).json({ error: "El oro total no puede ser negativo." });
    await db.run("UPDATE characters SET totalGold = ? WHERE id = ?", [totalGold, characterId]);
    res.json({ message: "Oro total actualizado." });
});

/**
 * Actualiza la salud del personaje.
 */
router.post("/update/health", async (req, res) => {
    const { characterId, health } = req.body;
    if (health < 0) return res.status(400).json({ error: "La salud no puede ser negativa." });
    await db.run("UPDATE characters SET health = ? WHERE id = ?", [health, characterId]);
    res.json({ message: "Salud actualizada." });
});

/**
 * Actualiza el ataque del personaje.
 */
router.post("/update/attack", async (req, res) => {
    const { characterId, attack } = req.body;
    if (attack < 0) return res.status(400).json({ error: "El ataque no puede ser negativo." });
    await db.run("UPDATE characters SET attack = ? WHERE id = ?", [attack, characterId]);
    res.json({ message: "Ataque actualizado." });
});

/**
 * Actualiza la defensa del personaje.
 */
router.post("/update/defense", async (req, res) => {
    const { characterId, defense } = req.body;
    if (defense < 0) return res.status(400).json({ error: "La defensa no puede ser negativa." });
    await db.run("UPDATE characters SET defense = ? WHERE id = ?", [defense, characterId]);
    res.json({ message: "Defensa actualizada." });
});

/**
 * Actualiza los puntos de mejora del personaje.
 */
router.post("/update/upgrade_points", async (req, res) => {
    const { characterId, upgrade_points } = req.body;
    if (upgrade_points < 0) return res.status(400).json({ error: "Los puntos de mejora no pueden ser negativos." });
    await db.run("UPDATE characters SET upgrade_points = ? WHERE id = ?", [upgrade_points, characterId]);
    res.json({ message: "Puntos de mejora actualizados." });
});

/**
 * Actualiza la última pelea del personaje.
 */
router.post("/update/last_fight", async (req, res) => {
    const { characterId, last_fight } = req.body;
    await db.run("UPDATE characters SET last_fight = ? WHERE id = ?", [last_fight, characterId]);
    res.json({ message: "Última pelea actualizada." });
});

module.exports = router;
