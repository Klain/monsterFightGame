import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { CharacterService } from '../services/character.service';
import { Observable } from 'rxjs';
import { map, first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NotCharacterGuard implements CanActivate {
  constructor(private characterService: CharacterService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.characterService.character$.pipe(
      first(),
      map(character => {
        if (!character) {
          console.log("🔄 No hay personaje, redirigiendo a /character-create...");
          this.router.navigate(['/character-create']);
          return false;
        }
        return true;
      })
    );
  }
}
