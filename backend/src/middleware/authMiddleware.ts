// backend/src/middleware/authMiddleware.ts
import jwt from "jsonwebtoken";
import { RequestHandler } from "express";
import "dotenv/config";

const authMiddleware: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Acceso no autorizado: No hay token o formato incorrecto." });
      return;
    }

    const token = authHeader.replace("Bearer ", "").trim();

    const verified = jwt.verify(token, process.env.JWT_SECRET!) as { id: number; username: string };

    if (!verified.id || !verified.username) {
      res.status(400).json({ error: "Token inválido o mal formado." });
      return;
    }
    
    if (!req.locals) { req.locals = {}; }
    // Asigna `req.user` directamente
    req.locals.user = {
      id: verified.id,
      username: verified.username,
    };

    next(); // Continúa al controlador
  } catch (error) {
    console.error("Error al validar el token:", error);
    res.status(401).json({ error: "Token inválido o expirado." });
  }
};

export default authMiddleware;


