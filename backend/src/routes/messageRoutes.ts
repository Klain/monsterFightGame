import express, { Request, Response } from "express";
import authMiddleware from "../middleware/authMiddleware";
import { validateCharacterMiddleware } from "../middleware/validateCharacterMiddleware";
import { validateMessageMiddleware } from "../middleware/validateMessageMiddleware"; 
import { Character } from "../models/character.model";
import { Message } from "../models/message.model";
import CharacterService from "../services/characterService";
import { sendMessage, getMessages, markMessageAsRead, getMessageById, getCountMessages } from "../services/messageService";
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
    const receiver = await CharacterService.getCharacterById(receiver_id);
    if (!receiver){
      res.status(404).json({ error: "Destinatario no encontrado." });
      return;
    }

    const newMessage : Message = new Message({
      id: null,
      sender_id: sender.id,
      sender_name: sender.name,
      receiver_id: receiver.id,
      receiver_name: receiver.name,
      subject: subject,
      body: body,
      timestamp: new Date(),
      read: false
    });

    const message = await sendMessage(newMessage);
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

export default router;


