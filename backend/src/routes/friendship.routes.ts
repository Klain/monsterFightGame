import express, { Request, response, Response } from "express";
import authMiddleware from "../middleware/authMiddleware";
import { validateCharacterMiddleware } from "../middleware/validateCharacterMiddleware";
import { Character } from "../models/character.model";
import CacheDataService from "../services/cache/CacheDataService";
import { CharacterService } from "../services/character.service";

const router = express.Router();

router.post( "/friends",  authMiddleware, validateCharacterMiddleware, async (req: Request, res: Response) => {
  try {
    const character : Character = req.locals.character;
    const friendshipsList = CharacterService.getFriends(character);
    res.status(200).json(friendshipsList);
  } catch (error) {
    console.error("Error al obtener listado amigos:", error);
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
router.post( "/acceptFriendship",  authMiddleware, validateCharacterMiddleware, async (req: Request, res: Response) => {
  try {
    const character : Character = req.locals.character;
    const friendshipId : number = req.body?.friendshipId;
    const friendshipRequest = CacheDataService.getFriendshipById(friendshipId);
    if(!friendshipRequest){ 
      res.status(404).json({error:"Error al encontrar la solicitud de amistad."});
      return;
    }
    CharacterService.acceptFriendship(friendshipRequest);
    res.status(200);
  } catch (error) {
    console.error("Error al al aceptar la solicitud de amistad :", error);
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
