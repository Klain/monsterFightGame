//front\monsterGameFight\src\app\core\services\auth.service.ts
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, catchError, throwError, tap } from 'rxjs';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { WebSocketService } from './websocket.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authStateSubject = new BehaviorSubject<boolean>(this.hasValidAccessToken());
  authState$ = this.authStateSubject.asObservable();

  constructor(
    private api: ApiService, 
    private router: Router
  ) {}

  // Iniciar sesión
  login(username: string, password: string): Observable<any> {
    return this.api.post('auth/login', { username, password }).pipe(
      tap((response: any) => {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        this.updateAuthState(true);

        // Emitir un evento para que otro servicio o componente maneje la conexión WebSocket
        document.dispatchEvent(new CustomEvent('websocket:connect'));
      }),
      catchError(this.handleAuthError.bind(this))
    );
  }

  // Registro
  register(username: string, password: string): Observable<any> {
    return this.api.post('auth/register', { username, password }).pipe(
      catchError(this.handleAuthError.bind(this))
    );
  }

  // Cerrar sesión
  logout(): void {
    this.clearTokens();
    this.updateAuthState(false);
    this.router.navigate(['/auth/login']);
  }

  // Renovar el token
  refreshToken(): Observable<string> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      console.warn('No hay refresh token disponible.');
      this.logout();
      return throwError(() => new Error('No hay refresh token.'));
    }
  
    return this.api.post<{ accessToken: string }>('auth/refresh-token', { refreshToken }).pipe(
      tap((response: any) => {
        this.saveTokens(response.accessToken, refreshToken);
        this.updateAuthState(true);
      }),
      catchError((error: any) => {
        if (error.error?.error === 'invalid_refresh_token') {
          console.warn('El refresh token ha expirado o no es válido.');
          this.logout();
        }
        return throwError(() => error);
      })
    );
  }
  

  // Comprobar si el usuario está autenticado
  isAuthenticated(): boolean {
    return this.authStateSubject.getValue();
  }

  // Decodificar el token para obtener información
  decodeToken(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      console.error('Error al decodificar el token:', e);
      return null;
    }
  }

  // Verificar si el token de acceso es válido
  private hasValidAccessToken(): boolean {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return false;

    const tokenData = this.decodeToken(accessToken);
    const currentTime = Math.floor(Date.now() / 1000);
    return tokenData?.exp > currentTime;
  }

  // Guardar tokens en localStorage
  private saveTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  // Limpiar tokens de localStorage
  private clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  // Actualizar el estado de autenticación
  private updateAuthState(isAuthenticated: boolean): void {
    this.authStateSubject.next(isAuthenticated);
  }

  // Manejo de errores de autenticación
  private handleAuthError(error: HttpErrorResponse) {
    if (error.status === 401) {
      console.warn('Sesión expirada o credenciales inválidas. Cerrando sesión.');
      this.logout();
    }
    return throwError(() => error);
  }
}
