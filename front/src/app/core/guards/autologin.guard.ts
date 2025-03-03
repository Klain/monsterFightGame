import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
import { Observable, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AutoLoginGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    console.log("🔍 Intentando restaurar sesión...");

    const hasTokens = this.tokenService.getAccessToken() && this.tokenService.getRefreshToken();

    if (!hasTokens) {
      console.warn("🚫 No hay tokens almacenados. No se puede restaurar sesión.");
      return of(true);
    }

    return this.authService.restoreSession().pipe(
      tap(((sessionRestored:boolean) => {
        if (sessionRestored) {
          console.log("✅ Sesión restaurada. Redirigiendo a /game...");
          this.router.navigate(['/game']);
        }
      }),
      switchMap(() => of(false)) 
    ));
  }
}
