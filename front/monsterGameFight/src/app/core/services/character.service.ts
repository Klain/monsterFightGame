import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { Character } from '../models/chacter.models';

@Injectable({
  providedIn: 'root',
})
export class CharacterService {
  private characterSubject = new BehaviorSubject<Character | null>(null);
  character$ = this.characterSubject.asObservable();

  constructor(private api: ApiService) {}

  getCharacter(): Observable<Character> {
    return this.api.get<Character>('characters').pipe(
      tap((character: Character) => this.characterSubject.next(character))
    );
  }
  refreshCharacter(): void {
    this.getCharacter().subscribe();
  }
  updateCharacterState(updatedCharacter:Character):void{
    this.characterSubject.next(updatedCharacter)
  }
  getUpgradeCost(attribute: string): Observable<{ attribute: string; cost: number }> {
    return this.api.get<{ attribute: string; cost: number }>(
      `characters/attributes/upgrade-cost/${attribute}`
    );
  }
  upgradeAttribute(attribute: string): Observable<Character> {
    return this.api
      .post<Character>('characters/attributes/upgrade-attribute', { attribute })
      .pipe(
        tap((updatedCharacter: Character) =>
          this.characterSubject.next(updatedCharacter)
        )
      );
  }



  findOpponent(): Observable<any> {
    return this.api.get('characters/find-opponent');
  }
}
