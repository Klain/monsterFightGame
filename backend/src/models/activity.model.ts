import { ActivityType } from "../constants/activities";

export class Activity {
  id: number = 0;
  userId: number = 0;
  characterId: number = 0;
  type: ActivityType = "trabajo"; // Cambiado a tipo fuerte
  startTime: Date = new Date();
  duration: number = 0; // En minutos
  rewardXp: number = 0;
  rewardGold: number = 0;
  completed: boolean = false;

  constructor(data: Partial<Activity>) {
    Object.assign(this, data);
  }

  // Método para calcular el tiempo restante en minutos
  getRemainingTime(): number {
    const now = new Date();
    const elapsed = Math.floor((now.getTime() - this.startTime.getTime()) / 60000);
    return Math.max(this.duration - elapsed, 0);
  }
}
