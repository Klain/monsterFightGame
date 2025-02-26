import express, { Request, Response } from "express";
import authMiddleware from "../middleware/authMiddleware";
import { validateCharacterMiddleware } from "../middleware/validateCharacterMiddleware";
import { validateMessageMiddleware } from "../middleware/validateMessageMiddleware"; 
import { Character } from "../models/character.model";
import { Message } from "../models/message.model";
import CacheDataService from "../services/cache/CacheDataService";
import webSocketService from "../services/webSocketService";

const router = express.Router();

// Ruta: Enviar mensaje
router.post("/send", authMiddleware, validateCharacterMiddleware, validateMessageMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { receiver_id } = req.body;
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
      id: 0,
      senderId: sender.id,
      senderName: sender.name,
      receiverId: receiver.id,
      receiverName: receiver.name,
      subject: subject,
      body: body,
      timestamp: new Date(),
      read: false
    });
    CacheDataService.createMessage(newMessage);

    if( receiver.id != sender.id){
      webSocketService.characterNewMessageSend(sender.userId,{
      ...newMessage.wsr()
    });}
    webSocketService.characterNewMessageRecived(receiver.userId,{
      ...newMessage.wsr()
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
    const messages = CacheDataService.getCharacterMessagesInbox(character.id, page , limit);
    const totalMessages = CacheDataService.getCharacterMessagesInboxCount(character.id);
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
    const messages = CacheDataService.getCharacterMessagesOutbox(character.id,page,limit);
    const totalMessages = CacheDataService.getCharacterMessagesOutboxCount(character.id);
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
    const message = CacheDataService.getMessageById(+message_id);
    if(!message){
      res.status(404).json({ error: "Error al obtener el mensaje." });
      return;
    }
    CacheDataService.markMessageAsRead(message.id);
    const updatedMessage = CacheDataService.getMessageById(+message_id);
    webSocketService.characterNewMessageRecived(character.id, {
      ...updatedMessage?.wsr()
    })
    res.json(updatedMessage);
  } catch (error) {
    console.error("Error al marcar mensaje como leído:", error);
    res.status(500).json({ error: "Error interno al marcar mensaje como leído." });
  }
});

// Ruta: Eliminar un mensaje
router.delete("/:message_id", authMiddleware, validateCharacterMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { message_id } = req.params;
    if (!message_id || isNaN(Number(message_id))) {
      res.status(400).json({ error: "El ID del mensaje es obligatorio y debe ser un número válido." });
      return;
    }
    const character: Character = req.locals.character;
    const message = CacheDataService.getMessageById(Number(message_id));
    if (!message) {
      res.status(404).json({ error: "Mensaje no encontrado." });
      return;
    }
    //TODO revisar la eliminacion de mensajes para ser usable por ambos usuarios
    if (message.receiverId !== character.id && message.senderId !== character.id) {
      res.status(403).json({ error: "No tienes permiso para eliminar este mensaje." });
      return;
    }
    CacheDataService.deleteMessage(message);
    res.json(true);
  } catch (error) {
    console.error("Error al eliminar mensaje:", error);
    res.status(500).json({ error: "Error interno al eliminar mensaje." });
  }
});

export default router;


