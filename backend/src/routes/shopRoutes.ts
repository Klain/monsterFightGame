import express, { Request, Response } from "express";
import ShopService from "../services/shopService";
import authMiddleware from "../middleware/authMiddleware";
import { validateCharacterMiddleware } from "../middleware/validateCharacterMiddleware";
import { validateItemMiddleware } from "../middleware/validateItemMiddleware";

import webSocketService from "../services/webSocketService";
import InventoryService from "../services/inventoryService";
import { Item } from "../models/item.model";
import { Character } from "../models/character.model";
import { Inventory } from "../models/inventory.model";

const router = express.Router();

/**
 * 🔹 Obtener los ítems disponibles en la tienda
 */
router.get("/",authMiddleware,validateCharacterMiddleware,async (req: Request, res: Response) => {
  try {
    const character : Character = req.locals.character!;
    const shopItems = ShopService.getShopItems().filter((item:Item)=>item.levelRequired>=character.level-5 && item.levelRequired<=character.level+5)
    res.status(200).json(shopItems.map(item => ({
      ...item,
      priceBuy: item.price,
      priceSell: item.price /2
    })));
  } catch (error) {
    console.error("❌ Error al obtener tienda:", error);
    res.status(500).json({ error: "Error al obtener la tienda." });
  }
});

/**
 * 🛒 Comprar un ítem
 */
router.post("/buy", authMiddleware, validateCharacterMiddleware, validateItemMiddleware, async (req: Request, res: Response) => {
  try {
    const character : Character = req.locals.character!;
    const item : Item = req.locals.item!;

    if(character.currentGold >= item.price ){
      await ShopService.buyItem(character, item);

    }else{
      res.status(404).json({ error: "El personaje no dispone suficiente dinero." });
      return;
    }
    // 🛠️ Actualizamos el caché en lugar de volver a consultar la BD
    const updatedInventory = new Inventory(InventoryService.getInventory(character.id));
    
    webSocketService.characterRefresh(character.userId, {
      ...character.wsrCurrencies(),
      ...updatedInventory.wsrBackpack(),
    });

    res.status(200).json({ message: "Ítem comprado con éxito" });
  } catch (error:any) {
    console.error("❌ Error al comprar ítem:", error);
    res.status(500).json({ error: error.message || "Error al comprar el ítem." });
  }
});

/**
 * 💰 Vender un ítem
 */
 router.post("/sell", authMiddleware, validateCharacterMiddleware, async (req: Request, res: Response) => {
  try {
    const character = req.locals.character;
    const { itemId } = req.params;

    await InventoryService.sellItem(character.id, Number(itemId));

    // 🛠️ Actualizamos la caché sin hacer consultas innecesarias
    const updatedInventory = InventoryService.getInventory(character.id);

    webSocketService.characterRefresh(character.userId, {
      inventory: updatedInventory,
    });

    res.status(200).json({ message: "Ítem vendido con éxito" });
  } catch (error:any) {
    console.error("❌ Error al vender ítem:", error);
    res.status(500).json({ error: error.message || "Error al vender el ítem." });
  }
});

export default router;
