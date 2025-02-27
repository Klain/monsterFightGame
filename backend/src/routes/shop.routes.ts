import express, { Request, Response } from "express";
import ShopService from "../services/shop.service";
import authMiddleware from "../middleware/authMiddleware";
import { validateCharacterMiddleware } from "../middleware/validateCharacterMiddleware";
import { validateItemMiddleware } from "../middleware/validateItemMiddleware";
import webSocketService from "../services/webSocketService";
import { ItemDefinition } from "../models/itemDefinition.model";
import { Character } from "../models/character.model";
import { CharacterService } from "../services/character.service";
import CacheDataService from "../services/cache/CacheDataService";

const router = express.Router();

router.get("/",authMiddleware,validateCharacterMiddleware,async (req: Request, res: Response) => {
  try {
    const character : Character = req.locals.character!;
    const shopItems = ShopService.getShopItems().filter((item:ItemDefinition)=>item.levelRequired>=character.level-5 && item.levelRequired<=character.level+5)
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
router.post("/buy", authMiddleware, validateCharacterMiddleware, validateItemMiddleware, async (req: Request, res: Response) => {
  try {
    const character : Character = req.locals.character!;
    const item : ItemDefinition = req.locals.item!;

    if(!(character.currentGold >= item.price )){
      res.status(404).json({ error: "El personaje no dispone suficiente dinero." });
      return;
    }
    CharacterService.buyItem(character, item);
    webSocketService.characterRefresh(character.userId, {...character.wsr()});
    res.status(200).json({ message: "Ítem comprado con éxito" });
  } catch (error:any) {
    console.error("❌ Error al comprar ítem:", error);
    res.status(500).json({ error: error.message || "Error al comprar el ítem." });
  }
});
router.post("/sell", authMiddleware, validateCharacterMiddleware, async (req: Request, res: Response) => {
  try {
    const character : Character = req.locals.character;
    const { itemId } = req.body;
    const characterItemInstances = CacheDataService.getItemInstancesByCharacter(character);

    const itemToSell = characterItemInstances.find(item=>item.equipped==false && item.itemId==+itemId)
    if(!itemToSell){
      res.status(404).json({ error: "El personaje no dispone del objeto para vender." });
      return;
    }
    CharacterService.sellItem(character, itemToSell);
    webSocketService.characterRefresh(character.userId, {
      ...character.wsr(),
    });
    res.status(200).json({ message: "Ítem vendido con éxito" });
  } catch (error:any) {
    console.error("❌ Error al vender ítem:", error);
    res.status(500).json({ error: error.message || "Error al vender el ítem." });
  }
});

export default router;
