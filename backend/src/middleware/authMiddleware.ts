import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import "dotenv/config";
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";

// Extender JwtPayload para incluir las propiedades de User
interface DecodedToken extends jwt.JwtPayload {
  id: number;
  username: string;
}

const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const token = req.header("Authorization");

  if (!token) {
    next(new Error("Acceso no autorizado: No hay token."));
    return;
  }

  try {
    const formattedToken = token.replace("Bearer ", "").trim();
    const verified = jwt.verify(formattedToken, process.env.JWT_SECRET!) as DecodedToken;

    // Garantizamos que el token decodificado contiene las propiedades esperadas
    if (!verified.id || !verified.username) {
      throw new Error("Token inválido o mal formado.");
    }

    req.user = {
      id: verified.id,
      username: verified.username,
    };

    next();
  } catch (error) {
    next(new Error("Token inválido o expirado."));
  }
};

export default authMiddleware;
