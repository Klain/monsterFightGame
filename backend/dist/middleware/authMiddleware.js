"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/middleware/authMiddleware.ts
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require("dotenv/config");
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ error: "Acceso no autorizado: No hay token o formato incorrecto." });
            return;
        }
        const token = authHeader.replace("Bearer ", "").trim();
        const verified = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (!verified.id || !verified.username) {
            res.status(400).json({ error: "Token inválido o mal formado." });
            return;
        }
        // Asigna `req.user` directamente
        req.user = {
            id: verified.id,
            username: verified.username,
        };
        next(); // Continúa al controlador
    }
    catch (error) {
        console.error("Error al validar el token:", error);
        res.status(401).json({ error: "Token inválido o expirado." });
    }
};
exports.default = authMiddleware;
