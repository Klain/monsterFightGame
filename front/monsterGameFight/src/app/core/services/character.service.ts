import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';

export interface Character {
  id: number;
  name: string;
  level: number;
  health: number;
  currentGold: number;
  lastOpponent?: string;
  lastFightResult?: string;
  lastGoldWon?: number;
  lastXpWon?: number;
  totalXp?: number;
  currentXp?: number;  // 👈 Asegurar que existe
  totalGold?: number;
  attack?: number;
  defense?: number;
  upgrade_points?: number;
  last_fight?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CharacterService {
  private characterSubject = new BehaviorSubject<Character | null>(null);
  character$ = this.characterSubject.asObservable();

  constructor(private api: ApiService) {}

  // Obtener la información del personaje
  getCharacter(): Observable<Character> {
    return this.api.get<Character>('characters');
  }

  refreshCharacter(): void {
    this.getCharacter().subscribe(character => {
      this.characterSubject.next(character);
    });
  }

  // Obtener el costo de mejora de un atributo
  getUpgradeCost(attribute: string): Observable<{ attribute: string; cost: number }> {
    return this.api.get(`characters/upgrade-cost/${attribute}`);
  }

  // Mejorar un atributo del personaje
  upgradeAttribute(attribute: string): Observable<any> {
    return this.api.post('character/upgrade-attribute', { attribute }).pipe(() => {
      this.refreshCharacter();
      return this.character$;
    });
  }

  // Iniciar entrenamiento
  startTraining(): Observable<any> {
    return this.api.post('characters/train').pipe(() => {
      this.refreshCharacter();
      return this.character$;
    });
  }

  // Iniciar sanación
  startHealing(): Observable<any> {
    return this.api.post('characters/heal').pipe(() => {
      this.refreshCharacter();
      return this.character$;
    });
  }

  // Buscar oponente para combate
  findOpponent(): Observable<any> {
    return this.api.get('characters/find-opponent').pipe(() => {
      this.refreshCharacter();
      return this.character$;
    });
  }
}
