export enum CharacterClass {
    ADVENTURER,
    CORSAIR,
    TREASURE_HUNTER,
    ARCHEOMAGE,
}

export function getCharacterClassName(characterClass: CharacterClass): string {
    switch(characterClass){
        case CharacterClass.CORSAIR : return "Corsario";break;
        case CharacterClass.TREASURE_HUNTER : return "Cazador de tesoros";break;
        case CharacterClass.ARCHEOMAGE : return "Arqueomago";break;
        default : return "Aventurero";break;
    }
  }