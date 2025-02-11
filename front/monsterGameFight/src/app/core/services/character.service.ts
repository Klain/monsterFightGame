import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { Attributes, Character } from '../models/chacter.models';
import { WebSocketService } from './websocket.service';

@Injectable({
  providedIn: 'root',
})
export class CharacterService {
  private characterSubject = new BehaviorSubject<Character | null>(null);
  character$ = this.characterSubject.asObservable();

  constructor(private api: ApiService, private webSocketService: WebSocketService) {
    this.refreshCharacter().subscribe();
    this.webSocketService.on('characterRefresh').subscribe((partialCharacter:Partial<Character>) => {
      this.updateCharacterWithPartial(partialCharacter);
    });
  }

  private refreshCharacter(): Observable<Character> {
    return this.api.get<Character>('characters').pipe(
      tap({
        next: (character: Character) => this.characterSubject.next(character),
        error: (err:any) => console.error('Error al obtener el personaje:', err),
      })
    );
  }
  private updateCharacterWithPartial(partialCharacter: Partial<Character>): void {
    const currentCharacter = this.characterSubject.value;

    if (currentCharacter) {
      const updatedCharacter = { ...currentCharacter, ...partialCharacter };
      this.characterSubject.next(updatedCharacter);
    } else {
      console.warn('No hay un personaje cargado en el estado actual.');
    }
  }
  getLocalCharacter(): Character | null {
    return this.characterSubject.value;
  }

  upgradeAttribute(attribute: string): Observable<{ success: boolean }> {
    return this.api.post<{ success: boolean }>('characters/attributes/upgrade-attribute', { attribute }).subscribe({
      error: (err:any) => {console.error('Error al realizar la acción:', err)},
    });
  }

  startActivity(activityType: string, duration: number): Observable<void> {
    return this.api.post<void>('activities/start', { activityType, duration }).subscribe({
      error: (err:any) => {console.error('Error al realizar la acción:', err)},
    });
  }
  claimActivityReward(): Observable<Character> {
    return this.api.post<Character>('activities/claim').subscribe({
      error: (err:any) => {console.error('Error al realizar la acción:', err)},
    });
  }
  
  findOpponent(): Observable<any> {
    return this.api.get('characters/find-opponent');
  }
  
}
