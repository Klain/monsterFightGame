import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { Character } from '../models/chacter.models';
import { CharacterService } from './character.service';
import { Activity } from '../models/activity.model';

@Injectable({
  providedIn: 'root',
})
export class ActivityService {
  private currentActivitySubject = new BehaviorSubject<{ status: string; activity?: Activity } | null>(null);
  public currentActivity$ = this.currentActivitySubject.asObservable();

  constructor(
    private api: ApiService,
    private characterService: CharacterService
  ) {}

  getMaxDuration(activityType: string): Observable<{ activityType: string; maxDuration: number }> {
    return this.api.get<{ activityType: string; maxDuration: number }>(
      `activities/max-duration/${activityType}`
    );
  }

  startActivity(activityType: string, duration: number): Observable<void> {
    return this.api.post<void>('activities/start', { activityType, duration }).pipe(
      tap(() => this.refreshCurrentActivity())
    );
  }

  checkActivityStatus(): Observable<{ status: string; activity?: Activity } | null> {
    return this.api.get<{ status: string; activity?: Activity }>('activities/status').pipe(
      tap((status) => this.currentActivitySubject.next(status))
    );
  }

  claimActivityReward(): Observable<Character> {
    return this.api.post<Character>('activities/claim').pipe(
      tap((updatedCharacter: Character) => {
        this.characterService.updateCharacterState(updatedCharacter);
        this.currentActivitySubject.next(null); // Limpiar actividad en curso
      })
    );
  }

  refreshCurrentActivity() {
    this.checkActivityStatus().subscribe();
  }
}
