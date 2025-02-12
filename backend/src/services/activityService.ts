import DatabaseService from "./databaseService";
import { Character } from "../models/character.model";
import { Activity } from "../models/activity.model";
import CharacterService from "./characterService";
import { ActivityReward } from "../models/activityReward.model";

class ActivityService {

  static async startActivity(character: Character, activity: string, duration: number) {
    return DatabaseService.run(
      "INSERT INTO activities (character_id, type, start_time, duration, completed) VALUES (?, ?, CURRENT_TIMESTAMP, ?, FALSE)",
      [character.id, activity, duration]
    );
  }

  static async getActivityStatus(character: Character): Promise<Activity | null> {
    const activityDb = await DatabaseService.get<any>(
      "SELECT * FROM activities WHERE character_id = ? AND completed = FALSE",
      [character.id]
    );

    if(activityDb){
      const activity = Activity.parseDb(activityDb);
  
      if (!activity) {
        return null;
      }
    
      return activity;
    }else{
      return null;
    }

  }
  
  static async claimActivityReward(character: Character) {
    const activityDb : any = await DatabaseService.get(
      "SELECT * FROM activities WHERE character_id = ? AND completed = FALSE",
      [character.id]
    );
    if(activityDb){
      const activity = Activity.parseDb(activityDb);
      const remainingTime = activity.getRemainingTime();
      if (remainingTime > 0) {
        throw new Error("La actividad aún no está completada.");
      }
      const rewards = this.calculateActivityReward(activity.type, activity.duration);
      await CharacterService.updateCharacterRewards(character, rewards);
      await DatabaseService.run("DELETE FROM activities WHERE character_id = ?", [character.id]);
      return CharacterService.getCharacterById(character.id);
    }else{
      throw new Error("No hay una actividad para reclamar.");
    }
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
      case "descansar":
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