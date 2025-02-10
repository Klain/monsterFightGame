"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = require("../database");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const router = express_1.default.Router();
// Ruta: Obtener lista de ítems disponibles en la tienda
router.get("/", async (req, res) => {
    try {
        const items = await new Promise((resolve, reject) => {
            database_1.db.all("SELECT * FROM items", (err, rows) => {
                if (err)
                    return reject(err);
                resolve(rows);
            });
        });
        res.json({ store: items });
    }
    catch (error) {
        console.error("Error al obtener la tienda:", error);
        res.status(500).json({ error: "Error interno al obtener la tienda." });
    }
});
// Ruta: Comprar un ítem
router.post("/buy", authMiddleware_1.default, async (req, res) => {
    try {
        const { item_id } = req.body;
        const userId = req.locals?.user?.id || 0;
        if (!item_id) {
            res.status(400).json({ error: "El ID del ítem es obligatorio." });
            return;
        }
        const character = await new Promise((resolve, reject) => {
            database_1.db.get("SELECT * FROM characters WHERE user_id = ?", [userId], (err, row) => {
                if (err)
                    return reject(err);
                resolve(row);
            });
        });
        if (!character) {
            res.status(404).json({ error: "Personaje no encontrado." });
            return;
        }
        const item = await new Promise((resolve, reject) => {
            database_1.db.get("SELECT * FROM items WHERE id = ?", [item_id], (err, row) => {
                if (err)
                    return reject(err);
                resolve(row);
            });
        });
        if (!item) {
            res.status(404).json({ error: "Ítem no encontrado." });
            return;
        }
        if (character.currentGold < item.price) {
            res.status(400).json({ error: "No tienes suficiente oro para comprar este ítem." });
            return;
        }
        await new Promise((resolve, reject) => {
            database_1.db.run("UPDATE characters SET currentGold = currentGold - ? WHERE id = ?", [item.price, character.id], (err) => {
                if (err)
                    return reject(err);
                resolve();
            });
        });
        await new Promise((resolve, reject) => {
            database_1.db.run("INSERT INTO character_items (character_id, item_id) VALUES (?, ?)", [character.id, item.id], (err) => {
                if (err)
                    return reject(err);
                resolve();
            });
        });
        res.json({ message: "Compra realizada con éxito.", item });
    }
    catch (error) {
        console.error("Error al comprar el ítem:", error);
        res.status(500).json({ error: "Error interno al comprar el ítem." });
    }
});
// Ruta: Vender un ítem
router.post("/sell", authMiddleware_1.default, async (req, res) => {
    try {
        const { item_id } = req.body;
        const userId = req.locals.user?.id || 0;
        if (!item_id) {
            res.status(400).json({ error: "El ID del ítem es obligatorio." });
            return;
        }
        const character = await new Promise((resolve, reject) => {
            database_1.db.get("SELECT * FROM characters WHERE user_id = ?", [userId], (err, row) => {
                if (err)
                    return reject(err);
                resolve(row);
            });
        });
        if (!character) {
            res.status(404).json({ error: "Personaje no encontrado." });
            return;
        }
        const itemInInventory = await new Promise((resolve, reject) => {
            database_1.db.get("SELECT * FROM character_items WHERE character_id = ? AND item_id = ?", [character.id, item_id], (err, row) => {
                if (err)
                    return reject(err);
                resolve(row);
            });
        });
        if (!itemInInventory) {
            res.status(400).json({ error: "No posees este ítem." });
            return;
        }
        const item = await new Promise((resolve, reject) => {
            database_1.db.get("SELECT * FROM items WHERE id = ?", [item_id], (err, row) => {
                if (err)
                    return reject(err);
                resolve(row);
            });
        });
        if (!item) {
            res.status(404).json({ error: "Ítem no encontrado." });
            return;
        }
        const sellPrice = Math.floor(item.price * 0.5);
        await new Promise((resolve, reject) => {
            database_1.db.run("DELETE FROM character_items WHERE id = ?", [itemInInventory.id], (err) => {
                if (err)
                    return reject(err);
                resolve();
            });
        });
        await new Promise((resolve, reject) => {
            database_1.db.run("UPDATE characters SET currentGold = currentGold + ? WHERE id = ?", [sellPrice, character.id], (err) => {
                if (err)
                    return reject(err);
                resolve();
            });
        });
        res.json({ message: "Ítem vendido con éxito.", gold_earned: sellPrice });
    }
    catch (error) {
        console.error("Error al vender el ítem:", error);
        res.status(500).json({ error: "Error interno al vender el ítem." });
    }
});
exports.default = router;
