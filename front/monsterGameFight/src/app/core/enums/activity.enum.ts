export enum ActivityType {
    NONE,
    EXPLORE,
    HEAL,
    REST,
    MEDITATE,
    ENCHANTING,
}

export function getActivityName(activityType: ActivityType): string {
    switch(activityType){
        case ActivityType.NONE : return "Sin Actividad";break;
        case ActivityType.EXPLORE : return "Explorar";break;
        case ActivityType.HEAL : return "Sanar";break;
        case ActivityType.REST : return "Descansar";break;
        case ActivityType.MEDITATE : return "Meditar";break;
        default : return "Sin Actividad";break;
    }
  }