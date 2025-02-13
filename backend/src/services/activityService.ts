import DatabaseService from "./databaseService";
import { Character } from "../models/character.model";
import { Activity } from "../models/activity.model";
import CharacterService from "./characterService";
import { ActivityReward } from "../models/activityReward.model";

class ActivityService {

  static async startActivity(character: Character, activity: string, duration: number) {
    const startTime = new Date().toISOString();
    return DatabaseService.run(
      "INSERT INTO activities (character_id, type, start_time, duration, completed) VALUES (?, ?, ?, ?, FALSE)",
      [character.id, activity, startTime, duration]
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
    let result : ActivityReward = {};
    switch (activityType) {
      case "explorar":
        result = { xp: duration * 5, gold: duration * 2 , costStamina : duration , costHealth: Math.ceil(Math.random()*duration)};
        break;
      case "sanar":
        result = {health: duration * 5 }; 
        break;
      case "descansar":
        result = {stamina: duration * 5 }; 
        break;
      case "meditar":
        result = {mana : duration * 5}; 
        break;
    }
    return result;
  }
}

export default ActivityService;