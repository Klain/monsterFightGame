import { ActivityType } from "../constants/enums";
import CacheDataService from "../services/cache/CacheDataService";

export class Activity {
  private _id: number = 0;
  private _characterId: number = 0;
  private _type: ActivityType = 0;
  private _startTime: Date = new Date();
  private _duration: number = 0;
  private _completed: boolean = false;

  constructor(data: Partial<Activity>) {
    Object.assign(this, data);
  }

  private updateCache(): void {
    if (this._characterId) {
      CacheDataService.updateActivity(this);
    }
  }

  // GETTERS Y SETTERS
  get id() { return this._id; }
  set id(value: number) { this._id = value; this.updateCache(); }

  get characterId() { return this._characterId; }
  set characterId(value: number) { this._characterId = value; this.updateCache(); }

  get type() { return this._type; }
  set type(value: ActivityType) { this._type = value; this.updateCache(); }

  get startTime() { return this._startTime; }
  set startTime(value: Date) { this._startTime = value; this.updateCache(); }

  get duration() { return this._duration; }
  set duration(value: number) { this._duration = value; this.updateCache(); }

  get completed() { return this._completed; }
  set completed(value: boolean) { this._completed = value; this.updateCache(); }

  getRemainingTime(): number {
    const now = new Date();
    const elapsed = Math.floor((now.getTime() - this._startTime.getTime()) / 1000); // en segundos
    return Math.max(this._duration - elapsed, 0);
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
        type: this._type,
        startTime: this._startTime,
        duration: this._duration,
        completed: this._completed,
      }
    };
  }
}
