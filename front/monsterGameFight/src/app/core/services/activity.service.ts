import { Injectable } from '@angular/core';
import { Observable, tap,map } from 'rxjs';
import { ApiService } from './api.service';
import { Character } from '../models/chacter.models';
import { CharacterService } from './character.service';
import { Activity } from '../models/activity.model';

@Injectable({
  providedIn: 'root',
})
export class ActivityService {
  constructor(
    private api: ApiService,
    private characterService: CharacterService,
    ) {}

  getMaxDuration(activityType: string): Observable<{ activity: string; maxDuration: number }> {
    return this.api.get<{ activity: string; maxDuration: number }>(
      `activities/max-duration/${activityType}`
    );
  }

  startActivity(activityType: string, duration: number): Observable<void> {
    return this.api.post<void>('activities/start', { activity: activityType, duration });
  }

  checkActivityStatus(): Observable<{
    status: string;
    activity?: Activity;
  } | null> {
    return this.api.get<{ status: string; activity?: Activity }>('activities/status');
  }
  
  

  claimActivityReward(): Observable<Character> {
    return this.api.post<Character>('activities/claim').pipe(
      tap((updatedCharacter: Character) => {
        this.characterService.updateCharacterState(updatedCharacter);
      })
    );
  }
}
