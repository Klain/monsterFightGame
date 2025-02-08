import express, { Request, Response } from "express";
import authenticateToken from "../middleware/authMiddleware";
import { sendMessage, getMessages, markMessageAsRead } from "../services/messageService";
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";

const router = express.Router();

// Ruta: Enviar mensaje
router.post("/send", authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Usuario no autenticado." });
      return;
    }

    const { receiver_id, subject, body } = req.body;

    if (!receiver_id || !subject || !body) {
      res.status(400).json({ error: "receiver_id, subject y body son obligatorios." });
      return;
    }

    const result = await sendMessage(req.user.id, receiver_id, subject, body);
    res.json(result);
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
    res.status(500).json({ error: "Error interno al enviar mensaje." });
  }
});

// Ruta: Obtener mensajes
router.get("/", authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Usuario no autenticado." });
      return;
    }

    const messages = await getMessages(req.user.id);
    res.json({ messages });
  } catch (error) {
    console.error("Error al obtener mensajes:", error);
    res.status(500).json({ error: "Error interno al obtener mensajes." });
  }
});

// Ruta: Marcar mensaje como leído
router.post("/read/:message_id", authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Usuario no autenticado." });
      return;
    }

    const { message_id } = req.params;

    if (!message_id) {
      res.status(400).json({ error: "El ID del mensaje es obligatorio." });
      return;
    }

    const result = await markMessageAsRead(Number(message_id));
    res.json(result);
  } catch (error) {
    console.error("Error al marcar mensaje como leído:", error);
    res.status(500).json({ error: "Error interno al marcar mensaje como leído." });
  }
});

export default router;
