// backend/src/middleware/authMiddleware.ts
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import "dotenv/config";

const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.header("Authorization");

    // Validar que exista el header y tenga el formato correcto
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Acceso no autorizado: Token no proporcionado o formato incorrecto." });
      return;
    }

    const token = authHeader.replace("Bearer ", "").trim();

    // Verificar el token usando ACCESS_SECRET
    const verified = jwt.verify(token, process.env.ACCESS_SECRET!) as { id: number; username: string };

    // Verificar que el token tenga los datos esperados
    if (!verified || typeof verified.id !== "number" || typeof verified.username !== "string") {
      res.status(400).json({ error: "Token inválido o mal formado." });
      return;
    }

    // Asegurarse de que `req.locals` esté inicializado
    if (!req.locals) req.locals = {};
    req.locals.user = {
      id: verified.id,
      username: verified.username,
    };

    next(); // Pasar al siguiente middleware o ruta
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
