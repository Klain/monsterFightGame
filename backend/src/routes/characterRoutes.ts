import express, { Request, Response } from "express";
import { db } from "../database";
import CharacterService from "../services/characterService";
import DatabaseService from "../services/databaseService";
import authMiddleware from "../middleware/authMiddleware";
import { AttributeType } from "../constants/attributes";
import { Character } from "../models/character.model";
import { validateCharacterMiddleware } from "../middleware/validateCharacterMiddleware";
import { validateAttributeMiddleware } from "../middleware/validateAttributeMiddleware copy";

const router = express.Router();

// Ruta: Obtener el costo de mejora de un atributo
router.get("/attributes/upgrade-cost/:attribute", authMiddleware , validateAttributeMiddleware, validateCharacterMiddleware , async (req: Request, res: Response): Promise<void> => {
  try {
    const { attribute } = req.params;
    const character = req.locals.character;

    const currentValue = character[attribute as keyof Pick<Character, AttributeType>];
    const cost = character.calculateUpgradeCost(currentValue);

    res.json({ attribute, cost });
  } catch (error) {
    console.error("❌ Error al obtener el costo de mejora:", error);
    res.status(500).json({ error: "Error interno al calcular el costo de mejora." });
  }
});

// Ruta: Mejorar un atributo del personaje
router.post("/attributes/upgrade-attribute", authMiddleware , validateAttributeMiddleware, validateCharacterMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { attribute } = req.body;
    const userId = req.locals.user.id;
    const character = req.locals.character;

    const currentValue = character[attribute as keyof Pick<Character, AttributeType>];
    const cost = character.calculateUpgradeCost(currentValue);
    const currencies = DatabaseService.getCurrenciesFromCache(character.id);

    if (!currencies || currencies.currentXp < cost) {
      res.status(400).json({ error: "No tienes suficiente experiencia para mejorar este atributo." });
      return;
    }

    await CharacterService.upgradeCharacterAttribute(userId, attribute);

    const updatedCharacter = await CharacterService.getCharacterById(userId);
    res.json(updatedCharacter);
    
  } catch (error) {
    console.error("Error en la mejora de atributo:", error);
    res.status(500).json({ error: "Error interno al mejorar el atributo." });
  }
});

// Ruta: Obtener el ranking
router.get("/leaderboard", async (req: Request, res: Response): Promise<void> => {
  try {
    const leaderboard = await new Promise<any[]>((resolve, reject) => {
      db.all(
        `SELECT name, level, totalXp, totalGold FROM characters ORDER BY totalXp DESC LIMIT 10`,
        (err, rows) => {
          if (err) {
            return reject(err);
          }
          resolve(rows);
        }
      );
    });

    res.json({ leaderboard });
  } catch (error) {
    console.error("Error al obtener ranking:", error);
    res.status(500).json({ error: "Error interno al obtener el ranking." });
  }
});

// Ruta: Crear un nuevo personaje

router.post("/", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.locals.user;
    const { name, faction, class: characterClass } = req.body;

    if (!name || !faction || !characterClass) {
      res.status(400).json({ error: "Todos los campos son obligatorios." });
      return;
    }

    const existingCharacter = await new Promise<any[]>((resolve, reject) => {
      db.all("SELECT * FROM characters WHERE user_id = ?", [userId], (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });

    if (existingCharacter.length > 0) {
      res.status(400).json({ error: "Ya tienes un personaje creado." });
      return;
    }

    const result = await new Promise<{ lastID: number }>((resolve, reject) => {
      db.run(
        `INSERT INTO characters (user_id, name, faction, class) VALUES (?, ?, ?, ?)`,
        [userId, name, faction, characterClass],
        function (this: any, err: Error | null) {
          if (err) {
            return reject(err);
          }
          resolve({ lastID: this.lastID });
        }
      );
    });

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

// Ruta: Obtener el personaje del usuario autenticado
router.get("/", authMiddleware,validateCharacterMiddleware , async (req: Request, res: Response): Promise<void> => {
  try {
    const character = req.locals.character;

    res.json(character);
  } catch (error) {
    console.error("❌ Error al obtener personaje:", error);
    res.status(500).json({ error: "Error interno al recuperar el personaje." });
  }
});

export default router;
