// src/middleware/validateAttributeMiddleware.ts
import { Request, Response, NextFunction } from "express";
import { isAttribute } from "../constants/attributes";

export const validateAttributeMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { attribute } = req.params;

  if (!isAttribute(attribute)) {
    res.status(400).json({ error: `El atributo '${attribute}' no es válido.` });
    return;
  }

  next();
};