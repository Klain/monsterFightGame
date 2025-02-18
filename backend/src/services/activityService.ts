import CacheDataService from "./CacheDataService";
import { Character } from "../models/character.model";
import { Activity } from "../models/activity.model";
import CharacterService from "./characterService";
import { ActivityReward } from "../models/activityReward.model";
import { ActivityType } from "../constants/enums";

class ActivityService {

  static async startActivity(character: Character, activity: ActivityType, duration: number) {
    const startTime = new Date().toISOString();
    return CacheDataService.run(
      "INSERT INTO activities (character_id, type, start_time, duration, completed) VALUES (?, ?, ?, ?, FALSE)",
      [character.id, activity, startTime, duration]
    );
  }

  static async getActivityStatus(character: Character): Promise<Activity | null> {
    const activityDb = await CacheDataService.get<any>(
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
    const activityDb : any = await CacheDataService.get(
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
      await CacheDataService.run("DELETE FROM activities WHERE character_id = ?", [character.id]);
      return CharacterService.getCharacterById(character.id);
    }else{
      throw new Error("No hay una actividad para reclamar.");
    }
  }
  

  static calculateActivityReward(activityType: ActivityType, duration: number) {
    let result : ActivityReward = {};
    switch (activityType) {
      case ActivityType.EXPLORE:
        result = { xp: duration * 5, gold: duration * 2 , costStamina : duration , costHealth: Math.ceil(Math.random()*duration)};
        break;
      case ActivityType.HEAL:
        result = {health: duration * 5 }; 
        break;
      case ActivityType.REST:
        result = {stamina: duration * 5 }; 
        break;
      case ActivityType.MEDITATE:
        result = {mana : duration * 5}; 
        break;
    }
    return result;
  }
}

export default ActivityService;