import express, { Request, Response } from "express";
import authMiddleware from "../middleware/authMiddleware";
import { validateCharacterMiddleware } from "../middleware/validateCharacterMiddleware";
import { validateMessageMiddleware } from "../middleware/validateMessageMiddleware"; 
import { Character } from "../models/character.model";
import { Message } from "../models/message.model";
import CacheDataService from "../services/CacheDataService";
import webSocketService from "../services/webSocketService";

const router = express.Router();

// Ruta: Enviar mensaje
router.post("/send", authMiddleware, validateCharacterMiddleware, validateMessageMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { receiver_id } = req.body;
    const userId = req.locals.user?.id || 0;
    const sender : Character = req.locals.character;
    const { subject , body } = req.locals.message!;

    if (!receiver_id || !subject || !body) {
      res.status(400).json({ error: "receiver_id, subject y body son obligatorios." });
      return;
    }
    const receiver = CacheDataService.getCharacterById(receiver_id);
    if (!receiver){
      res.status(404).json({ error: "Destinatario no encontrado." });
      return;
    }

    const newMessage : Message = new Message({
      id: null,
      senderId: sender.id,
      senderName: sender.name,
      receiverId: receiver.id,
      receiverName: receiver.name,
      subject: subject,
      body: body,
      timestamp: new Date(),
      read: false
    });

    sender.sendMessage(newMessage);

    if( receiver.id != sender.id){webSocketService.characterNewMessageSend(sender.userId,{
      ...message.wsr()
    });}
    webSocketService.characterNewMessageRecived(receiver.userId,{
      ...message.wsr()
    });
    res.status(200).json({response:"Mensaje enviado con éxito"});
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
    res.status(500).json({ error: "Error interno al enviar mensaje." });
  }
});

// Ruta: Obtener mensajes
router.get("/inbox", authMiddleware,validateCharacterMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const inbox = req.query.inbox === 'true';

    if (page < 1 || limit < 1) {
      res.status(400).json({ error: "Los parámetros page y limit deben ser números positivos." });
      return;
    }

    const character : Character = req.locals.character;
    const messages = await getMessages(character.id,page,limit);
    const totalMessages = await getCountMessages(character.id);
    res.json({
      messages,
      page,
      limit,
      total: totalMessages || 0,
      totalPages: Math.ceil((totalMessages || 1) / limit)
    });
  } catch (error) {
    console.error("Error al obtener mensajes:", error);
    res.status(500).json({ error: "Error interno al obtener mensajes." });
  }
});
router.get("/outbox", authMiddleware,validateCharacterMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    if (page < 1 || limit < 1) {
      res.status(400).json({ error: "Los parámetros page y limit deben ser números positivos." });
      return;
    }

    const character : Character = req.locals.character;
    const messages = await getMessages(character.id,page,limit,false);
    const totalMessages = await getCountMessages(character.id);
    res.json({
      messages,
      page,
      limit,
      total: totalMessages || 0,
      totalPages: Math.ceil((totalMessages || 1) / limit)
    });
  } catch (error) {
    console.error("Error al obtener mensajes:", error);
    res.status(500).json({ error: "Error interno al obtener mensajes." });
  }
});

// Ruta: Marcar mensaje como leído
router.post("/read/:message_id", authMiddleware,validateCharacterMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const character : Character = req.locals.character;

    const { message_id } = req.params;
    if (!message_id) {
      res.status(400).json({ error: "El ID del mensaje es obligatorio." });
      return;
    }

    const message = await getMessageById(+message_id);
    if(!message){
      res.status(404).json({ error: "Error al obtener el mensaje." });
      return;
    }
    const result = await markMessageAsRead(message);

    message.read = true;
    webSocketService.characterNewMessageRecived(character.id, {
      ...message.wsr()
    })

    res.json(result);
  } catch (error) {
    console.error("Error al marcar mensaje como leído:", error);
    res.status(500).json({ error: "Error interno al marcar mensaje como leído." });
  }
});

// Ruta: Eliminar un mensaje
router.delete("/:message_id", authMiddleware, validateCharacterMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { message_id } = req.params;

    // Verificar que el ID del mensaje sea válido
    if (!message_id || isNaN(Number(message_id))) {
      res.status(400).json({ error: "El ID del mensaje es obligatorio y debe ser un número válido." });
      return;
    }

    // Verificar que el mensaje existe y pertenece al personaje actual
    const character: Character = req.locals.character;
    const message = await getMessageById(Number(message_id));
    if (!message) {
      res.status(404).json({ error: "Mensaje no encontrado." });
      return;
    }

    if (message.receiver_id !== character.id && message.sender_id !== character.id) {
      res.status(403).json({ error: "No tienes permiso para eliminar este mensaje." });
      return;
    }

    // Eliminar el mensaje
    const result = await deleteMessage(Number(message_id));
    res.json(result);
  } catch (error) {
    console.error("Error al eliminar mensaje:", error);
    res.status(500).json({ error: "Error interno al eliminar mensaje." });
  }
});

export default router;


