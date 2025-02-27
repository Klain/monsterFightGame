import { ActivityType } from "../constants/enums";

export class Activity {
  readonly id: number = 0;
  readonly characterId: number = 0;
  readonly type: ActivityType = 0;
  readonly startTime: Date = new Date();
  readonly duration: number = 0;
  
  constructor(data: Partial<Activity>) {
    Object.assign(this, data);
  }
  isComplete():boolean{
    return this.getRemainingTime()>=0;
  }
  getRemainingTime(): number {
    const now = new Date();
    const elapsed = Math.floor((now.getTime() - this.startTime.getTime()) / 1000); // en segundos
    return Math.max(this.duration - elapsed, 0);
  }
  static calculateActivityReward(activityType: ActivityType, duration: number): Record<string, number> {
    let reward: Record<string, number> = {};

    switch (activityType) {
      case ActivityType.EXPLORE:
        reward = { xp: duration * 5, gold: duration * 2, costStamina: duration, costHealth: Math.ceil(Math.random() * duration) };
        break;
      case ActivityType.HEAL:
        reward = { health: duration * 5 };
        break;
      case ActivityType.REST:
        reward = { stamina: duration * 5 };
        break;
      case ActivityType.MEDITATE:
        reward = { mana: duration * 5 };
        break;
    }

    return reward;
  }
  wsr(): any {
    return {
      activity: {
        type: this.type,
        startTime: this.startTime,
        duration: this.duration,
      }
    };
  }
}
