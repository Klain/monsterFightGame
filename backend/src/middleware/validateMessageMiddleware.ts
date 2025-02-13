// src/middleware/validateMessageMiddleware.ts
import { Request, Response, NextFunction } from "express";
import sanitizeHtml from "sanitize-html";


export const validateMessageMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { subject, body } = req.body;

    const sanitizedSubject = sanitizeHtml(subject, { allowedTags: [], allowedAttributes: {} });
    const sanitizedBody = sanitizeHtml(body, { allowedTags: ["b", "i", "strong"], allowedAttributes: {} });

    if (subject.length > 100) {
      res.status(400).json({ error: "El asunto no puede exceder los 100 caracteres." });
    }
    if (body.length > 1000) {
      res.status(400).json({ error: "El cuerpo no puede exceder los 1000 caracteres." });  
    }

    req.locals.message = {
      subject : sanitizedSubject,
      body: sanitizedBody
    }

  } catch (error) {
    console.error("❌ Error al validar el personaje:", error);
    res.status(500).json({ error: "Error interno al validar el personaje." });
  }
};
