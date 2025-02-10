"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//backend\src\routes\authRoutes.ts
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userServices_1 = require("../services/userServices");
const characterService_1 = __importDefault(require("../services/characterService"));
const sessionManager_1 = require("../sessionManager");
require("dotenv/config");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const router = express_1.default.Router();
// Ruta: Registro
router.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            res.status(400).json({ error: "Todos los campos son obligatorios." });
            return;
        }
        const existingUser = await (0, userServices_1.getUserByUsername)(username);
        if (existingUser) {
            res.status(400).json({ error: "El usuario ya existe." });
            return;
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const newUser = await (0, userServices_1.createUser)(username, hashedPassword);
        await characterService_1.default.createCharacterForUser(newUser.id, username);
        res.status(201).json({ message: "Usuario y personaje creados exitosamente." });
    }
    catch (error) {
        console.error("Error en el registro de usuario:", error);
        res.status(500).json({ error: "Error interno en el registro." });
    }
});
// Ruta: Inicio de sesión
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await (0, userServices_1.getUserByUsername)(username);
        if (!user || !(await bcrypt_1.default.compare(password, user.password))) {
            res.status(401).json({ error: "Credenciales inválidas." });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "1h" });
        (0, sessionManager_1.registerSession)(user.id, token);
        res.json({ token });
    }
    catch (error) {
        console.error("Error en el inicio de sesión:", error);
        res.status(500).json({ error: "Error interno en el inicio de sesión." });
    }
});
// Ruta: Cerrar sesión
router.post("/logout", authMiddleware_1.default, (req, res) => {
    const userId = req.locals.user?.id || 0;
    (0, sessionManager_1.logoutUser)(userId);
    res.json({ success: true, message: "Sesión cerrada correctamente." });
});
// Ruta: Verificar sesión
router.get("/check-session", authMiddleware_1.default, (req, res) => {
    const userId = req.locals.user?.id || 0;
    res.json({
        success: true,
        message: "Sesión válida.",
        user: userId,
    });
});
exports.default = router;
