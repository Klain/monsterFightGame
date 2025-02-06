//backend\src\routes\storeRoutes.js
const express = require("express");
const { db } = require("../database");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * Obtener lista de ítems disponibles en la tienda
 */
router.get("/", async (req, res) => {
    try {
        const items = await db.all("SELECT * FROM items");
        res.json({ store: items });
    } catch (error) {
        console.error("Error al obtener la tienda:", error);
        res.status(500).json({ error: "Error interno al obtener la tienda." });
    }
});

/**
 * Comprar un ítem
 */
router.post("/buy", authenticateToken, async (req, res) => {
    try {
        const { item_id } = req.body;
        const user_id = req.user.id;

        if (!item_id) {
            return res.status(400).json({ error: "El ID del ítem es obligatorio." });
        }

        // Obtener personaje del usuario
        const character = await db.get("SELECT * FROM characters WHERE user_id = ?", [user_id]);
        if (!character) return res.status(404).json({ error: "Personaje no encontrado." });

        // Obtener el ítem
        const item = await db.get("SELECT * FROM items WHERE id = ?", [item_id]);
        if (!item) return res.status(404).json({ error: "Ítem no encontrado." });

        // Verificar si el personaje tiene suficiente oro
        if (character.currentGold < item.price) {
            return res.status(400).json({ error: "No tienes suficiente oro para comprar este ítem." });
        }

        // Restar oro y agregar ítem al inventario
        await db.run("UPDATE characters SET currentGold = currentGold - ? WHERE id = ?", [item.price, character.id]);
        await db.run("INSERT INTO character_items (character_id, item_id) VALUES (?, ?)", [character.id, item.id]);

        res.json({ message: "Compra realizada con éxito.", item });
    } catch (error) {
        console.error("Error al comprar el ítem:", error);
        res.status(500).json({ error: "Error interno al comprar el ítem." });
    }
});

/**
 * Vender un ítem
 */
router.post("/sell", authenticateToken, async (req, res) => {
    try {
        const { item_id } = req.body;
        const user_id = req.user.id;

        if (!item_id) {
            return res.status(400).json({ error: "El ID del ítem es obligatorio." });
        }

        // Obtener personaje del usuario
        const character = await db.get("SELECT * FROM characters WHERE user_id = ?", [user_id]);
        if (!character) return res.status(404).json({ error: "Personaje no encontrado." });

        // Verificar si el personaje tiene el ítem
        const itemInInventory = await db.get(
            "SELECT * FROM character_items WHERE character_id = ? AND item_id = ?",
            [character.id, item_id]
        );
        if (!itemInInventory) return res.status(400).json({ error: "No posees este ítem." });

        // Obtener el precio de venta (50% del precio original)
        const item = await db.get("SELECT * FROM items WHERE id = ?", [item_id]);
        if (!item) return res.status(404).json({ error: "Ítem no encontrado." });

        const sellPrice = Math.floor(item.price * 0.5);

        // Eliminar ítem del inventario y agregar oro
        await db.run("DELETE FROM character_items WHERE id = ?", [itemInInventory.id]);
        await db.run("UPDATE characters SET currentGold = currentGold + ? WHERE id = ?", [sellPrice, character.id]);

        res.json({ message: "Ítem vendido con éxito.", gold_earned: sellPrice });
    } catch (error) {
        console.error("Error al vender el ítem:", error);
        res.status(500).json({ error: "Error interno al vender el ítem." });
    }
});

module.exports = router;
