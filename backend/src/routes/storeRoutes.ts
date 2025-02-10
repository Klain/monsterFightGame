import express, { Request, Response } from "express";
import { db } from "../database";
import authMiddleware from "../middleware/authMiddleware";
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";

const router = express.Router();

// Ruta: Obtener lista de ítems disponibles en la tienda
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const items = await new Promise<any[]>((resolve, reject) => {
      db.all("SELECT * FROM items", (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });

    res.json({ store: items });
  } catch (error) {
    console.error("Error al obtener la tienda:", error);
    res.status(500).json({ error: "Error interno al obtener la tienda." });
  }
});

// Ruta: Comprar un ítem
router.post("/buy", authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Usuario no autenticado." });
      return;
    }

    const { item_id } = req.body;
    const user_id = req.user.id;

    if (!item_id) {
      res.status(400).json({ error: "El ID del ítem es obligatorio." });
      return;
    }

    const character = await new Promise<any>((resolve, reject) => {
      db.get("SELECT * FROM characters WHERE user_id = ?", [user_id], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });

    if (!character) {
      res.status(404).json({ error: "Personaje no encontrado." });
      return;
    }

    const item = await new Promise<any>((resolve, reject) => {
      db.get("SELECT * FROM items WHERE id = ?", [item_id], (err, row) => {
        if (err) return reject(err);
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

    await new Promise<void>((resolve, reject) => {
      db.run("UPDATE characters SET currentGold = currentGold - ? WHERE id = ?", [item.price, character.id], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    await new Promise<void>((resolve, reject) => {
      db.run("INSERT INTO character_items (character_id, item_id) VALUES (?, ?)", [character.id, item.id], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    res.json({ message: "Compra realizada con éxito.", item });
  } catch (error) {
    console.error("Error al comprar el ítem:", error);
    res.status(500).json({ error: "Error interno al comprar el ítem." });
  }
});

// Ruta: Vender un ítem
router.post("/sell", authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Usuario no autenticado." });
      return;
    }

    const { item_id } = req.body;
    const user_id = req.user.id;

    if (!item_id) {
      res.status(400).json({ error: "El ID del ítem es obligatorio." });
      return;
    }

    const character = await new Promise<any>((resolve, reject) => {
      db.get("SELECT * FROM characters WHERE user_id = ?", [user_id], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });

    if (!character) {
      res.status(404).json({ error: "Personaje no encontrado." });
      return;
    }

    const itemInInventory = await new Promise<any>((resolve, reject) => {
      db.get(
        "SELECT * FROM character_items WHERE character_id = ? AND item_id = ?",
        [character.id, item_id],
        (err, row) => {
          if (err) return reject(err);
          resolve(row);
        }
      );
    });

    if (!itemInInventory) {
      res.status(400).json({ error: "No posees este ítem." });
      return;
    }

    const item = await new Promise<any>((resolve, reject) => {
      db.get("SELECT * FROM items WHERE id = ?", [item_id], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });

    if (!item) {
      res.status(404).json({ error: "Ítem no encontrado." });
      return;
    }

    const sellPrice = Math.floor(item.price * 0.5);

    await new Promise<void>((resolve, reject) => {
      db.run("DELETE FROM character_items WHERE id = ?", [itemInInventory.id], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    await new Promise<void>((resolve, reject) => {
      db.run("UPDATE characters SET currentGold = currentGold + ? WHERE id = ?", [sellPrice, character.id], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    res.json({ message: "Ítem vendido con éxito.", gold_earned: sellPrice });
  } catch (error) {
    console.error("Error al vender el ítem:", error);
    res.status(500).json({ error: "Error interno al vender el ítem." });
  }
});

export default router;
