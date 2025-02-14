import { ActivityType } from "../constants/enums"; 
export class Activity {
  id: number = 0;
  userId: number = 0;
  characterId: number = 0;
  type: ActivityType = 0;
  startTime: Date = new Date();
  duration: number = 0; 
  completed: boolean = false;

  constructor(data: Partial<Activity>) {
    Object.assign(this, data);
  }

  // Método para calcular el tiempo restante en minutos
  getRemainingTime(): number {
    const now = new Date();
    const elapsed = Math.floor((now.getTime() - this.startTime.getTime()));
    return Math.max(this.duration - elapsed, 0);
  }

  wsr():any{
    return {
      activity:{
        type : this.type ,
        startTime : this.startTime ,
        duration : this.duration, 
      }
    }
  }

  static parseDb(data: {
    character_id: number;
    completed: boolean;
    duration: number;
    id: number;
    start_time: string | Date;
    type: number;
  }): Activity {
    const startTime = typeof data.start_time === "string" ? new Date(data.start_time) : data.start_time;
  
    return new Activity({
      id: data.id,
      characterId: data.character_id,
      type: data.type,
      startTime,
      duration: data.duration,
      completed: data.completed,
    });
  }
  
  
  
}
