import { Request, Response } from "express";
import DatabaseService from "./databaseService";
import { sendRealTimeNotification, connectedUsers } from "../sessionManager";
import { sendMessage } from "./messageService";
import { Character } from "../models/character.model";
import { Activity } from "../models/activity.model";

const HEALING_COST_PER_MINUTE = 10;

class ActivityService {
  // Función: Notificar finalización de actividad
  static async notifyActivityCompletion(character_id: number, title: string, message: string): Promise<void> {
    try {
      const character = await DatabaseService.get<Character>("SELECT * FROM characters WHERE id = ?", [character_id]);
      if (!character) return;

      if (connectedUsers.has(character.userId)) {
        sendRealTimeNotification(character.userId, message);
      } else {
        await sendMessage(0, character.userId, title, message);
      }
    } catch (error) {
      console.error("Error al enviar notificación de actividad:", error);
    }
  }

  // Función: Verificar actividades completadas
  static async checkCompletedActivities(): Promise<void> {
    try {
      const now = new Date();
      const activities = await DatabaseService.all<Activity>("SELECT * FROM activities WHERE completed = FALSE");

      for (const activity of activities) {
        const startTime = new Date(activity.startTime);
        const elapsedMinutes = Math.floor((now.getTime() - startTime.getTime()) / 60000);

        if (elapsedMinutes >= activity.duration) {
          await DatabaseService.run("UPDATE activities SET completed = TRUE WHERE id = ?", [activity.id]);

          const character = await DatabaseService.get<Character>("SELECT * FROM characters WHERE id = ?", [activity.characterId]);
          if (!character) continue;

          // Actualizar recompensas del personaje
          await DatabaseService.run(
            "UPDATE characters SET currentXp = currentXp + ?, currentGold = currentGold + ? WHERE id = ?",
            [activity.rewardXp, activity.rewardGold, activity.characterId]
          );

          const messageText = `Tu actividad '${activity.type}' ha terminado. Recolecta tu recompensa.`;

          if (connectedUsers.has(character.userId)) {
            sendRealTimeNotification(character.userId, messageText);
          } else {
            await sendMessage(0, character.userId, "Actividad Finalizada", messageText);
          }
        }
      }
    } catch (error) {
      console.error("Error al verificar actividades completadas:", error);
    }
  }

  // Función: Iniciar actividad
  static async startActivity(
    user_id: number,
    character_id: number,
    type: string,
    duration: number,
    reward_xp: number,
    reward_gold: number,
    res: Response
  ): Promise<Response> {
    try {
      const existingActivity = await DatabaseService.get<Activity>(
        "SELECT * FROM activities WHERE character_id = ? AND completed = FALSE",
        [character_id]
      );

      if (existingActivity) {
        return res.status(400).json({ error: "Tu personaje ya está ocupado en otra actividad." });
      }

      const start_time = new Date();

      await DatabaseService.run(
        `INSERT INTO activities (user_id, character_id, type, start_time, duration, reward_xp, reward_gold) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [user_id, character_id, type, start_time, duration, reward_xp, reward_gold]
      );

      return res.json({ message: `Has comenzado la actividad: ${type}. Duración: ${duration} minutos.` });
    } catch (error) {
      return res.status(500).json({ error: "Error al iniciar la actividad." });
    }
  }


  // Función: Consultar estado de la actividad
  static async getActivityStatus(character_id: number, res: Response): Promise<Response> {
    try {
      const activity = await DatabaseService.get<Activity>(
        "SELECT * FROM activities WHERE character_id = ? AND completed = FALSE",
        [character_id]
      );

      if (!activity) {
        return res.json({ message: "No tienes ninguna actividad en curso." });
      }

      const now = new Date();
      const startTime = new Date(activity.startTime);
      const elapsedMinutes = Math.floor((now.getTime() - startTime.getTime()) / 60000);

      const remainingMinutes = Math.max(activity.duration - elapsedMinutes, 0);
      const isCompleted = remainingMinutes === 0;

      return res.json({
        type: activity.type,
        remainingMinutes,
        isCompleted,
      });
    } catch (error) {
      return res.status(500).json({ error: "Error al consultar el estado de la actividad." });
    }
  }


  // Función: Reclamar recompensa de actividad
  static async claimActivityReward(character_id: number, res: Response): Promise<Response> {
    try {
      const activity = await DatabaseService.get<Activity>(
        "SELECT * FROM activities WHERE character_id = ? AND completed = FALSE",
        [character_id]
      );

      if (!activity) {
        return res.status(400).json({ error: "No tienes ninguna actividad para reclamar." });
      }

      const now = new Date();
      const startTime = new Date(activity.startTime);
      const elapsedMinutes = Math.floor((now.getTime() - startTime.getTime()) / 60000);

      if (elapsedMinutes < activity.duration) {
        return res.status(400).json({ error: "Aún no ha pasado el tiempo necesario." });
      }

      // Marcar actividad como completada
      await DatabaseService.run("UPDATE activities SET completed = TRUE WHERE id = ?", [activity.id]);

      // Añadir recompensas al personaje
      await DatabaseService.run(
        "UPDATE characters SET currentXp = currentXp + ?, currentGold = currentGold + ? WHERE id = ?",
        [activity.rewardXp, activity.rewardGold, character_id]
      );

      return res.json({ message: "Recompensa reclamada exitosamente." });
    } catch (error) {
      return res.status(500).json({ error: "Error al reclamar la recompensa." });
    }
  }
}

export default ActivityService;