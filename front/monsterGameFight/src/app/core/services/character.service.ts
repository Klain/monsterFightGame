import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { ApiService } from './api.service';
import { Character } from '../models/chacter.models';


@Injectable({
  providedIn: 'root',
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
    this.getCharacter().subscribe((character: any) => {
      this.characterSubject.next(character);
    });
  }

  // Obtener el costo de mejora de un atributo
  getUpgradeCost(attribute: string): Observable<{ attribute: string; cost: number }> {
    return this.api.get(`characters/attributes/upgrade-cost/${attribute}`);
  }

  // Mejorar un atributo del personaje
  upgradeAttribute(attribute: string): Observable<Character> {
    return this.api.post<Character>('characters/attributes/upgrade-attribute', { attribute }).pipe(
      tap((updatedCharacter: Character) => {
        this.characterSubject.next(updatedCharacter); // Actualiza directamente el flujo reactivo
      })
    );
  }

  activityCheckStatus(){
    return this.api.get(`activities/status/`);
  }

  activityClaimReward(){
    return this.api.post<Character>('activities/claim',).pipe(
      tap((updatedCharacter: Character) => {
        this.characterSubject.next(updatedCharacter);
      })
    );
  }

  // Iniciar entrenamiento
  startTraining(duration:number): Observable<Character> {
    return this.api.post<Character>('activities/training/start',{duration:duration}).pipe(
      tap((updatedCharacter: Character) => {
        this.characterSubject.next(updatedCharacter);
      })
    );
  }

  // Iniciar sanación
  startHealing(): Observable<Character> {
    return this.api.post<Character>('activities/heal').pipe(
      tap((updatedCharacter: Character) => {
        this.characterSubject.next(updatedCharacter);
      })
    );
  }

  // Buscar oponente para combate
  findOpponent(): Observable<any> {
    return this.api.get('characters/find-opponent'); 
  }
}
