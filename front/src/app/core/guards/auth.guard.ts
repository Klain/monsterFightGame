//front\monsterGameFight\src\app\core\guards\auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private isRefreshing = false;

  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    if (this.authService.authState$) {
      return this.authService.authState$;
    }

    const accessToken = this.tokenService.getAccessToken();
    const refreshToken = this.tokenService.getRefreshToken();

    if (!accessToken || !refreshToken) {
      console.warn('🚫 No hay tokens disponibles. Redirigiendo a login.');
      this.router.navigate(['/auth/login']);
      return false;
    }

    if (this.tokenService.hasValidAccessToken()) {
      return true;
    }

    if (this.isRefreshing) {
      console.warn('🔄 Ya se está renovando el token. Esperando...');
      return of(false);
    }

    console.warn('⚠️ Access token expirado. Intentando renovar...');
    this.isRefreshing = true;

    return this.authService.refreshToken().pipe(
      map(() => {
        console.log('✅ Renovación exitosa. Acceso permitido.');
        this.isRefreshing = false;
        return true;
      }),
      catchError(() => {
        console.error('❌ No se pudo renovar el token. Redirigiendo a login.');
        this.authService.logout();
        this.router.navigate(['/auth/login']);
        this.isRefreshing = false;
        return of(false);
      })
    );
  }
}
