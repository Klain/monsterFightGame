import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import "dotenv/config";
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";

interface DecodedToken extends jwt.JwtPayload {
  id: number;
  username: string;
}

const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Acceso no autorizado: No hay token o formato incorrecto." });
      return; 
    }

    const token = authHeader.replace("Bearer ", "").trim();

    const verified = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;

    if (!verified.id || !verified.username) {
      res.status(400).json({ error: "Token inválido o mal formado." });
      return; 
    }

    req.user = {
      id: verified.id,
      username: verified.username,
    };

    next();
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({ error: "Token inválido o expirado." });
    } else {
      res.status(500).json({ error: "Error interno del servidor." });
    }
  }
};

export default authMiddleware;
