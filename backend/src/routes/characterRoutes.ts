import express, { Request, Response } from "express";
import { db } from "../database";
import authenticateToken from "../middleware/authMiddleware";
import CharacterService from "../services/characterService";
import { validateAttributeExist } from "../utils/validationUtils";
import DatabaseService from "../services/databaseService";
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";

const router = express.Router();

// Ruta: Obtener el costo de mejora de un atributo
interface UpgradeCostRequest extends AuthenticatedRequest {
  params: {
        attribute: "strength" | "endurance" | "constitution" | "precision" | "agility" | "vigor" | "spirit" | "willpower" | "arcane"
  };
}

router.get("/attributes/upgrade-cost/:attribute", authenticateToken, async (req: UpgradeCostRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Usuario no autenticado." });
      return;
    }

    const { attribute } = req.params;
    const character = await CharacterService.getCharacterById(req.user.id);

    if (!validateAttributeExist(attribute).success) {
      res.status(400).json({ error: validateAttributeExist(attribute).error });
      return;
    }

    if (!character) {
      res.status(404).json({ error: "Personaje no encontrado." });
      return;
    }

    if (!(attribute in character)) {
      res.status(400).json({ error: `El atributo '${attribute}' no existe en el personaje.` });
      return;
    }

    const currentValue = character[attribute];
    const cost = character.calculateUpgradeCost(currentValue);

    res.json({ attribute, cost });
  } catch (error) {
    console.error("❌ Error al obtener el costo de mejora:", error);
    res.status(500).json({ error: "Error interno al calcular el costo de mejora." });
  }
});

// Ruta: Mejorar un atributo del personaje
interface UpgradeAttributeRequest extends AuthenticatedRequest {
  body: {
        attribute: "strength" | "endurance" | "constitution" | "precision" | "agility" | "vigor" | "spirit" | "willpower" | "arcane"
  };
}
router.post("/attributes/upgrade-attribute", authenticateToken, async (req: UpgradeAttributeRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Usuario no autenticado." });
      return;
    }

    const { attribute } = req.body;
    const character = await CharacterService.getCharacterById(req.user.id);

    if (!validateAttributeExist(attribute).success) {
      res.status(400).json({ error: validateAttributeExist(attribute).error });
      return;
    }

    if (!character) {
      res.status(404).json({ error: "Personaje no encontrado." });
      return;
    }

    if (!(attribute in character)) {
      res.status(400).json({ error: `El atributo '${attribute}' no existe en el personaje.` });
      return;
    }

    const currentValue = character[attribute];
    const cost = character.calculateUpgradeCost(currentValue);
    const currencies = DatabaseService.getCurrenciesFromCache(character.id);

    if (!currencies || currencies.currentXp < cost) {
      res.status(400).json({ error: "No tienes suficiente experiencia para mejorar este atributo." });
      return;
    }

    await CharacterService.upgradeCharacterAttribute(req.user.id, attribute);

    const updatedCharacter = await CharacterService.getCharacterById(req.user.id);

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

router.post("/", authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Usuario no autenticado." });
      return;
    }
    const userId = req.user;

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
router.get("/", authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Usuario no autenticado." });
      return;
    }
    const userId = req.user.id;

    const rows = await new Promise<any[]>((resolve, reject) => {
      db.all("SELECT * FROM characters WHERE user_id = ?", [userId], (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });

    if (!rows.length) {
      res.status(404).json({ error: "No se encontró un personaje para este usuario." });
      return;
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("❌ Error al obtener personaje:", error);
    res.status(500).json({ error: "Error interno al recuperar el personaje." });
  }
});

export default router;
