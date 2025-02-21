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
  private isRefreshing = false; // <-- Flag para evitar bucles

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> | boolean {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (!accessToken || !refreshToken) {
      console.warn('No hay tokens disponibles. Redirigiendo al login.');
      this.router.navigate(['/auth/login']);
      return false;
    }

    if (this.authService.isAuthenticated()) {
      return true;
    }

    if (this.isRefreshing) {
      console.warn('Ya se está renovando el token. Esperando...');
      return of(false);
    }

    this.isRefreshing = true;
    console.warn('Access token expirado. Intentando renovar...');

    return this.authService.refreshToken().pipe(
      map(() => {
        console.log('Renovación exitosa. Acceso permitido.');
        this.isRefreshing = false;
        return true;
      }),
      catchError((error: any) => {
        console.error('Error al renovar el token:', error);
        this.authService.logout();
        this.router.navigate(['/auth/login']);
        this.isRefreshing = false;
        return of(false);
      })
    );
  }
}

