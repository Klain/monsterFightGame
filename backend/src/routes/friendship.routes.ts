//backend\src\routes\friendship.routes.ts
import express, { Request, response, Response } from "express";
import authMiddleware from "../middleware/authMiddleware";
import { validateCharacterMiddleware } from "../middleware/validateCharacterMiddleware";
import { Character } from "../models/character.model";
import CacheDataService from "../services/cache/CacheDataService";
import { CharacterService } from "../services/character.service";
import { Friendship } from "../models/friendship.model";

const router = express.Router();

router.get("/friends", authMiddleware, validateCharacterMiddleware, async (req: Request, res: Response) => {
  try {
    const character: Character = req.locals.character;
    const friendshipData = character.getFriendshipData();
    res.status(200).json(friendshipData);
  } catch (error) {
    console.error("Error al obtener amistades:", error);
    res.status(500).json({ error: "Error interno." });
  }
});


router.post( "/sendFriendRequest",  authMiddleware, validateCharacterMiddleware, async (req: Request, res: Response) => {
  try {
    const character : Character = req.locals.character;
    const friendId : number = req.body?.friendId;
    const newFriend = CacheDataService.getUserById(friendId);
    if(!newFriend){ 
      res.status(404).json({error:"Error al encontrar el destinatario de la solicitud de amistad."});
      return;
    }
    const result = await CharacterService.sendFriendRequest(character,friendId);
    if(!result){
      res.status(404).json({error:"Error al enviar la solicitud de amistad"});
      return;
    }
    res.status(200).json(result);
  } catch (error) {
    console.error("Error al enviar la solicitud de amistad :", error);
    res.status(500).json({ error: "Error interno." });
  }
});
router.post("/acceptFriendship", authMiddleware, validateCharacterMiddleware, async (req: Request, res: Response) => {
  try {
    const character: Character = req.locals.character;
    const userId = character.userId; // ✅ Usuario autenticado
    const friendshipId: number = req.body?.friendshipId;

    // ✅ Buscar la solicitud de amistad
    const friendshipRequest = CacheDataService.getFriendshipById(friendshipId);
    if (!friendshipRequest) { 
      res.status(404).json({ error: "Solicitud de amistad no encontrada." });return;
    }

    // ✅ Verificar que el usuario autenticado sea el receptor (idUser2)
    if (friendshipRequest.idUser2 !== userId) {
      res.status(403).json({ error: "No puedes aceptar esta solicitud." });return;
    }

    // ✅ Aceptar la amistad
    CharacterService.acceptFriendship(friendshipRequest);
    res.status(200).json({ message: "Amistad aceptada con éxito." });

  } catch (error) {
    console.error("Error al aceptar la solicitud de amistad:", error);
    res.status(500).json({ error: "Error interno." });
  }
});

router.post( "/deleteFriendship",  authMiddleware, validateCharacterMiddleware, async (req: Request, res: Response) => {
  try {
    const friendshipId : number = req.body?.friendshipId;
    const friendshipRequest = CacheDataService.getFriendshipById(friendshipId);
    if(!friendshipRequest){ 
      res.status(404).json({error:"Error al encontrar la solicitud de amistad."});
      return;
    }
    CharacterService.deleteFriendship(friendshipRequest);
    res.status(200);
  } catch (error) {
    console.error("Error al eliminar la amistad :", error);
    res.status(500).json({ error: "Error interno." });
  }
});

export default router;
