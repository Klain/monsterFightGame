import DatabaseService from "./databaseService";
import { sendRealTimeNotification, connectedUsers } from "../sessionManager";
import { sendMessage } from "./messageService";
import { Character } from "../models/character.model";
import { Activity } from "../models/activity.model";
import CharacterService from "./characterService";
import { ActivityReward } from "../models/activityReward.model";

class ActivityService {
  // Función: Notificar finalización de actividad
  static async notifyActivityCompletion(character: Character, title: string, message: string): Promise<void> {
    try {
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
      const activities: Activity[] = await DatabaseService.all<Activity>(
        "SELECT * FROM activities WHERE completed = FALSE"
      );
  
      for (const activity of activities) {
        const startTime = new Date(activity.startTime);
        const elapsedMinutes = Math.floor((now.getTime() - startTime.getTime()) / 60000);
        if (elapsedMinutes >= activity.duration) {
          await DatabaseService.run("UPDATE activities SET completed = TRUE WHERE id = ?", [activity.id]);
          const character = await DatabaseService.get<Character>(
            "SELECT * FROM characters WHERE id = ?", 
            [activity.characterId]
          );
          if (!character) continue;
          const rewards = this.calculateActivityReward(activity.type, activity.duration);
          await CharacterService.updateCharacterRewards(character, rewards);
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
  

  static async startActivity(character: Character, activity: string, duration: number) {
    return DatabaseService.run(
      "INSERT INTO activities (character_id, type, start_time, duration, completed) VALUES (?, ?, CURRENT_TIMESTAMP, ?, FALSE)",
      [character.id, activity, duration]
    );
  }

  static async getActivityStatus(character: Character): Promise<{ status: string; activity?: Activity }> {
    const activity = await DatabaseService.get<Activity>(
      "SELECT * FROM activities WHERE character_id = ? AND completed = FALSE",
      [character.id]
    );
  
    if (!activity) {
      return { status: "idle" };
    }
  
    const remainingTime = activity.getRemainingTime();
    return remainingTime > 0
      ? { status: "in_progress", activity }
      : { status: "completed" };
  }
  
  static async claimActivityReward(character: Character) {
    const activity = await DatabaseService.get<Activity>(
      "SELECT * FROM activities WHERE character_id = ? AND completed = FALSE",
      [character.id]
    );
    if (!activity) {
      throw new Error("No hay una actividad para reclamar.");
    }
    const remainingTime = activity.getRemainingTime();
    if (remainingTime > 0) {
      throw new Error("La actividad aún no está completada.");
    }
    const rewards = this.calculateActivityReward(activity.type, activity.duration);
    await CharacterService.updateCharacterRewards(character, rewards);
    await DatabaseService.run("UPDATE activities SET completed = TRUE WHERE character_id = ?", [character.id]);
    return CharacterService.getCharacterById(character.id);
  }
  

  static calculateActivityReward(activityType: string, duration: number) {
    let reward : ActivityReward = {};
    switch (activityType) {
      case "explorar":
        reward = { xp: duration * 5, gold: duration * 2 };
        break;
      case "sanar":
        reward = {health: duration * 5 }; 
        break;
      case "sanar":
        reward = {stamina: duration * 5 }; 
        break;
      case "meditar":
        reward = {mana:duration*5}; 
        break;
    }
    return reward;
  }
}

export default ActivityService;