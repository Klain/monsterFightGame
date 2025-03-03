//front\monsterGameFight\src\app\core\services\character.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, catchError } from 'rxjs';
import { ApiService } from './api.service';
import { Character } from '../models/character.models';
import { WebSocketService } from './websocket.service';
import { ActivityType } from '../enums/activity.enum';
import { of, throwError } from 'rxjs'; 

@Injectable({
  providedIn: 'root',
})
export class CharacterService {
  private characterSubject = new BehaviorSubject<Character | null>(null);
  character$ = this.characterSubject.asObservable();
  constructor(
    private api: ApiService, 
    private webSocketService: WebSocketService
  ) {

      this.webSocketService.isConnected$.subscribe((connected: any) => {
        if (connected) {
          console.log("🔄 WebSocket conectado, asegurando suscripción a characterRefresh...");
          this.webSocketService.on('characterRefresh').subscribe((partialCharacter: Partial<Character>) => {
            console.log("ServicioCharacter: CharacterRefresh");
            this.updateCharacterWithPartial(partialCharacter);
          });
        }
      });
  }
  loadCharacter(): Observable<Character | null> {
    console.log("🔄 Cargando personaje...");
    return this.api.get<Character>('characters').pipe(
      tap((character: Character) => {
        console.log("✅ Personaje cargado.");
        this.characterSubject.next(character);
      }),
      catchError((error: any) => {
        if (error.status === 404) {
          console.warn("⚠ No hay personaje registrado. Devolviendo null.");
          this.characterSubject.next(null);
          return of(null); 
        }
        return throwError(() => error); 
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
  upgradeAttribute(attribute: string):void{
    this.api.post<void>('characters/attributes/upgrade-attribute', { attribute }).subscribe({
      error: (err:any) => {console.error('Error al realizar la acción:', err)},
    });
  }
  startActivity(activityType: ActivityType, duration: number):void {
    this.api.post('activities/start', { activityType, duration }).subscribe({
      error: (err:any) => {console.error('Error al realizar la acción:', err)},
    });
  }
  claimActivityReward():void{
    this.api.post('activities/claim').subscribe({
      error: (err:any) => {console.error('Error al realizar la acción:', err)},
    });
  }
  findOpponent(): Observable<any> {
    return this.api.get('characters/find-opponent');
  }
  upgradeGoldChest(): void {
    this.api.post<void>('lair/goldChest', {}).subscribe({
      error: (err: any) => console.error('Error al mejorar Gold Chest:', err),
    });
  }
  upgradeWarehouse(): void {
    this.api.post<void>('lair/warehouse', {}).subscribe({
      error: (err: any) => console.error('Error al mejorar Warehouse:', err),
    });
  }
  upgradeEnviroment(): void {
    this.api.post<void>('lair/enviroment', {}).subscribe({
      error: (err: any) => console.error('Error al mejorar Environment:', err),
    });
  }
  upgradeTraps(): void {
    this.api.post<void>('lair/traps', {}).subscribe({
      error: (err: any) => console.error('Error al mejorar Traps:', err),
    });
  }
}


