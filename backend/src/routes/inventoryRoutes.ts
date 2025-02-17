import express, { Request, Response } from "express";
import InventoryService from "../services/inventoryService";
import authMiddleware from "../middleware/authMiddleware";
import { validateCharacterMiddleware } from "../middleware/validateCharacterMiddleware";
import webSocketService from "../services/webSocketService";

const router = express.Router();

/**
 * 📦 Obtener el inventario del personaje autenticado
 */
router.get("/", authMiddleware, validateCharacterMiddleware, async (req: Request, res: Response) => {
  try {
    const character = req.locals.character;
    const inventory = InventoryService.getInventory(character.id);
    res.status(200).json(inventory);
  } catch (error) {
    console.error("❌ Error al obtener inventario:", error);
    res.status(500).json({ error: "Error interno al recuperar el inventario." });
  }
});

/**
 * ⚔️ Equipar un ítem
 */
router.post("/equip/:itemId", authMiddleware, validateCharacterMiddleware, async (req: Request, res: Response) => {
  try {
    const character = req.locals.character;
    const { itemId } = req.params;

    await InventoryService.equipItem(character.id, Number(itemId));

    // Actualizamos directamente desde la caché
    const updatedInventory = InventoryService.getInventory(character.id);

    webSocketService.characterRefresh(character.userId, {
      inventory: updatedInventory,
    });

    res.status(200).json({ message: "Ítem equipado con éxito" });
  } catch (error:any) {
    console.error("❌ Error al equipar ítem:", error);
    res.status(500).json({ error: error.message || "Error al equipar el ítem." });
  }
});

/**
 * ❌ Desequipar un ítem
 */
router.post("/unequip/:itemId", authMiddleware, validateCharacterMiddleware, async (req: Request, res: Response) => {
  try {
    const character = req.locals.character;
    const { itemId } = req.params;

    await InventoryService.unequipItem(character.id, Number(itemId));

    // Actualizamos el inventario en caché
    const updatedInventory = InventoryService.getInventory(character.id);

    webSocketService.characterRefresh(character.userId, {
      inventory: updatedInventory,
    });

    res.status(200).json({ message: "Ítem desequipado con éxito" });
  } catch (error:any) {
    console.error("❌ Error al desequipar ítem:", error);
    res.status(500).json({ error: error.message || "Error al desequipar el ítem." });
  }
});

/**
 * 💰 Vender un ítem
 */
router.post("/sell/:itemId", authMiddleware, validateCharacterMiddleware, async (req: Request, res: Response) => {
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
