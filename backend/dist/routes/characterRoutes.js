"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = require("../database");
const characterService_1 = __importDefault(require("../services/characterService"));
const validationUtils_1 = require("../utils/validationUtils");
const databaseService_1 = __importDefault(require("../services/databaseService"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const router = express_1.default.Router();
router.get("/attributes/upgrade-cost/:attribute", authMiddleware_1.default, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Usuario no autenticado." });
            return;
        }
        const { attribute } = req.params;
        const character = await characterService_1.default.getCharacterById(req.user.id);
        if (!(0, validationUtils_1.validateAttributeExist)(attribute).success) {
            res.status(400).json({ error: (0, validationUtils_1.validateAttributeExist)(attribute).error });
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
    }
    catch (error) {
        console.error("❌ Error al obtener el costo de mejora:", error);
        res.status(500).json({ error: "Error interno al calcular el costo de mejora." });
    }
});
router.post("/attributes/upgrade-attribute", authMiddleware_1.default, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Usuario no autenticado." });
            return;
        }
        const { attribute } = req.body;
        const character = await characterService_1.default.getCharacterById(req.user.id);
        if (!(0, validationUtils_1.validateAttributeExist)(attribute).success) {
            res.status(400).json({ error: (0, validationUtils_1.validateAttributeExist)(attribute).error });
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
        const currencies = databaseService_1.default.getCurrenciesFromCache(character.id);
        if (!currencies || currencies.currentXp < cost) {
            res.status(400).json({ error: "No tienes suficiente experiencia para mejorar este atributo." });
            return;
        }
        await characterService_1.default.upgradeCharacterAttribute(req.user.id, attribute);
        const updatedCharacter = await characterService_1.default.getCharacterById(req.user.id);
        res.json(updatedCharacter);
    }
    catch (error) {
        console.error("Error en la mejora de atributo:", error);
        res.status(500).json({ error: "Error interno al mejorar el atributo." });
    }
});
// Ruta: Obtener el ranking
router.get("/leaderboard", async (req, res) => {
    try {
        const leaderboard = await new Promise((resolve, reject) => {
            database_1.db.all(`SELECT name, level, totalXp, totalGold FROM characters ORDER BY totalXp DESC LIMIT 10`, (err, rows) => {
                if (err) {
                    return reject(err);
                }
                resolve(rows);
            });
        });
        res.json({ leaderboard });
    }
    catch (error) {
        console.error("Error al obtener ranking:", error);
        res.status(500).json({ error: "Error interno al obtener el ranking." });
    }
});
// Ruta: Crear un nuevo personaje
router.post("/", authMiddleware_1.default, async (req, res) => {
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
        const existingCharacter = await new Promise((resolve, reject) => {
            database_1.db.all("SELECT * FROM characters WHERE user_id = ?", [userId], (err, rows) => {
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
        const result = await new Promise((resolve, reject) => {
            database_1.db.run(`INSERT INTO characters (user_id, name, faction, class) VALUES (?, ?, ?, ?)`, [userId, name, faction, characterClass], function (err) {
                if (err) {
                    return reject(err);
                }
                resolve({ lastID: this.lastID });
            });
        });
        res.status(201).json({
            id: result.lastID,
            name,
            faction,
            class: characterClass,
            level: 1,
            experience: 0,
        });
    }
    catch (error) {
        console.error("Error al crear personaje:", error);
        res.status(500).json({ error: "Error interno al crear el personaje." });
    }
});
// Ruta: Obtener el personaje del usuario autenticado
router.get("/", authMiddleware_1.default, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Usuario no autenticado." });
            return;
        }
        const userId = req.user.id;
        const rows = await new Promise((resolve, reject) => {
            database_1.db.all("SELECT * FROM characters WHERE user_id = ?", [userId], (err, rows) => {
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
    }
    catch (error) {
        console.error("❌ Error al obtener personaje:", error);
        res.status(500).json({ error: "Error interno al recuperar el personaje." });
    }
});
exports.default = router;
