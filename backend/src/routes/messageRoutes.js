//backend\src\routes\messageRoutes.js
const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const { sendMessage, getMessages, markMessageAsRead } = require("../services/messageService");

const router = express.Router();

/**
 * Enviar un mensaje a otro jugador.
 */
router.post("/send", authenticateToken, async (req, res) => {
  try {
    const { receiver_id, subject, body } = req.body;

    if (!receiver_id || !subject || !body) {
      return res.status(400).json({ error: "receiver_id, subject y body son obligatorios." });
    }

    const result = await sendMessage(req.user.id, receiver_id, subject, body);
    res.json(result);
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
    res.status(500).json({ error: "Error interno al enviar mensaje." });
  }
});

/**
 * Obtener mensajes del usuario autenticado.
 */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const messages = await getMessages(req.user.id);
    res.json({ messages });
  } catch (error) {
    console.error("Error al obtener mensajes:", error);
    res.status(500).json({ error: "Error interno al obtener mensajes." });
  }
});

/**
 * Marcar un mensaje como leído.
 */
router.post("/read/:message_id", authenticateToken, async (req, res) => {
  try {
    const { message_id } = req.params;

    if (!message_id) {
      return res.status(400).json({ error: "El ID del mensaje es obligatorio." });
    }

    const result = await markMessageAsRead(message_id);
    res.json(result);
  } catch (error) {
    console.error("Error al marcar mensaje como leído:", error);
    res.status(500).json({ error: "Error interno al marcar mensaje como leído." });
  }
});

module.exports = router;
