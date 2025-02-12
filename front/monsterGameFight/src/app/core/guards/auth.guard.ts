//front\monsterGameFight\src\app\core\guards\auth.service.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> | boolean {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (!accessToken || !refreshToken) {
      // No hay tokens, redirige al login
      this.router.navigate(['/auth/login']);
      return false;
    }

    const tokenData = this.decodeToken(accessToken);
    const currentTime = Math.floor(Date.now() / 1000);

    if (tokenData.exp > currentTime) {
      // El `accessToken` es válido, permite el acceso
      return true;
    } else {
      // El `accessToken` ha expirado, intenta renovarlo
      return this.authService.refreshToken().pipe(
        map(() => {
          // Renovación exitosa, permite el acceso
          return true;
        }),
        catchError(() => {
          // Si falla la renovación, redirige al login
          this.authService.logout();
          this.router.navigate(['/auth/login']);
          return of(false); // Devuelve un observable con el valor `false`
        })
      );
    }
  }

  private decodeToken(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  }
}
