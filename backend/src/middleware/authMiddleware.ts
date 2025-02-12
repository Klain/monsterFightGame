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

    // Usar ACCESS_SECRET para verificar el token
    const verified = jwt.verify(token, process.env.ACCESS_SECRET!) as { id: number; username: string };

    if (!verified.id || !verified.username) {
      res.status(400).json({ error: "Token inválido o mal formado." });
      return;
    }

    if (!req.locals) req.locals = {};
    req.locals.user = {
      id: verified.id,
      username: verified.username,
    };

    next(); // Continúa al controlador
  } catch (error: any) {
    console.error("Error al validar el token:", error);

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
