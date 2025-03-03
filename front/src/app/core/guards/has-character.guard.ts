import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { CharacterService } from '../services/character.service';
import { Observable } from 'rxjs';
import { map, first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HasCharacterGuard implements CanActivate {
  constructor(private characterService: CharacterService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.characterService.character$.pipe(
      first(),
      map(character => {
        if (character) {
          console.log("🔄 Ya tienes personaje, redirigiendo a /game...");
          this.router.navigate(['/game']);
          return false;
        }
        return true;
      })
    );
  }
}
