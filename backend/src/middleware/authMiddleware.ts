// backend/src/middleware/authMiddleware.ts
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import "dotenv/config";
import CacheDataService from "../services/cache/CacheDataService";

const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Acceso no autorizado: Token no proporcionado o formato incorrecto." });
      return;
    }
    const token = authHeader.replace("Bearer ", "").trim();
    const verified = jwt.verify(token, process.env.ACCESS_SECRET!) as { id: number; username: string };
    if (!verified || typeof verified.id !== "number" || typeof verified.username !== "string") {
      res.status(400).json({ error: "Token inválido o mal formado." });
      return;
    }
    
    const verifiedUser = CacheDataService.cacheUsers.get(verified.id); 
    if (!verifiedUser) {
      res.status(404).json({ error: "Usuario no encontrado" });
      return;
    }
    if (!req.locals) req.locals = {};
    req.locals.user = verifiedUser;
    next();
  } catch (error: any) {
    console.error("Error al validar el token:", error);
    // Manejar errores específicos del JWT
    if (error.name === "TokenExpiredError") {
      res.status(401).json({ error: "Token expirado. Por favor, renueva tu sesión." });
    } else if (error.name === "JsonWebTokenError") {
      res.status(401).json({ error: "Token inválido. Por favor, verifica tus credenciales." });
    } else {
      res.status(500).json({ error: "Error interno al validar el token." });
    }
  }
};

export default authMiddleware;
