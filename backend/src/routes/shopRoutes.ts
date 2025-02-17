import express, { Request, Response } from "express";
import ShopService from "../services/shopService";
import authMiddleware from "../middleware/authMiddleware";
import { validateCharacterMiddleware } from "../middleware/validateCharacterMiddleware";
import webSocketService from "../services/webSocketService";
import InventoryService from "../services/inventoryService";
import { Item } from "../models/item.model";
import { Character } from "../models/character.model";

const router = express.Router();

/**
 * 🔹 Obtener los ítems disponibles en la tienda
 */
router.get("/",authMiddleware,validateCharacterMiddleware,async (req: Request, res: Response) => {
  try {
    const character : Character = req.locals.character!;
    const shopItems = await ShopService.getShopItems();
    res.status(200).json(shopItems.filter((item:Item)=>item.levelRequired>=character.level-5 && item.levelRequired<=character.level+5));
  } catch (error) {
    console.error("❌ Error al obtener tienda:", error);
    res.status(500).json({ error: "Error al obtener la tienda." });
  }
});

/**
 * 🛒 Comprar un ítem
 */
router.post("/buy/:itemId", authMiddleware, validateCharacterMiddleware, async (req: Request, res: Response) => {
  try {
    const character = req.locals.character;
    const { itemId } = req.params;

    await ShopService.buyItem(character.id, Number(itemId));

    // 🛠️ Actualizamos el caché en lugar de volver a consultar la BD
    const updatedInventory = InventoryService.getInventory(character.id);

    webSocketService.characterRefresh(character.userId, {
      inventory: updatedInventory,
    });

    res.status(200).json({ message: "Ítem comprado con éxito" });
  } catch (error:any) {
    console.error("❌ Error al comprar ítem:", error);
    res.status(500).json({ error: error.message || "Error al comprar el ítem." });
  }
});

export default router;
