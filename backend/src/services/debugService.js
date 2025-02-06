//backend\src\services\debugService.js
const db = require("../database");
/**
 * Actualiza un atributo específico de un personaje.
 * @param {number} characterId - ID del personaje.
 * @param {string} attribute - Atributo a modificar.
 * @param {any} value - Nuevo valor del atributo.
 * @param {object} res - Respuesta HTTP.
 */
async function updateCharacterAttribute(characterId, attribute, value, res) {
    try {
        const validAttributes = [
            "name", "faction", "class", "level", "currentXp", "totalXp", 
            "currentGold", "totalGold", "health", "attack", "defense", 
            "upgrade_points", "last_fight"
        ];

        if (!validAttributes.includes(attribute)) {
            return res.status(400).json({ error: "Atributo inválido." });
        }

        await db.run(`UPDATE characters SET ${attribute} = ? WHERE id = ?`, [value, characterId]);
        res.json({ message: `Atributo ${attribute} actualizado a ${value}` });
    } catch (error) {
        console.error("Error al actualizar atributo:", error);
        res.status(500).json({ error: "Error interno en la actualización del atributo." });
    }
}

module.exports = { updateCharacterAttribute };