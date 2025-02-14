import { StatusEffect } from "../constants/enums";

export class CharacterStatus {
    type: StatusEffect = 0; // Tipo de efecto
    duration: number = 0; // Duración en turnos o segundos
    magnitude?: number = 0; // Magnitud del efecto (opcional)
  
    constructor(data: Partial<CharacterStatus>) {
      Object.assign(this, data);
    }
  }