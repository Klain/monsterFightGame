//front\monsterGameFight\src\app\core\services\auth.service.ts
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, catchError, throwError, tap, timer, switchMap } from 'rxjs';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { TokenService } from './token.service';
import { WebSocketService } from './websocket.service';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authStateSubject = new BehaviorSubject<boolean>(false);
  authState$ = this.authStateSubject.asObservable();
  private refreshTimer$?: Observable<any>;

  constructor(
    private api: ApiService,
    private router: Router,
    private tokenService: TokenService,
    private websocketService: WebSocketService
  ) {
    this.initAuthState();
  }

   isAuthenticated(): boolean {
    return this.authStateSubject.getValue();
  }

  login(username: string, password: string): Observable<any> {
    return this.api.post('auth/login', { username, password }).pipe(
      tap((response: any) => {
        this.tokenService.saveTokens(response.accessToken, response.refreshToken);
        this.updateAuthState(true);
        this.startTokenRefreshTimer();
      }),
      catchError(this.handleAuthError.bind(this))
    );
  }

  register(username: string, password: string): Observable<any> {
    return this.api.post('auth/register', { username, password }).pipe(
      catchError(this.handleAuthError.bind(this))
    );
  }

  logout(): void {
    this.tokenService.clearTokens();
    this.updateAuthState(false);
    this.refreshTimer$ = undefined; 
    this.router.navigate(['/auth/login']);
  }

  refreshToken(): Observable<string> {
    const refreshToken = this.tokenService.getRefreshToken();
    if (!refreshToken) {
      console.warn('No hay refresh token disponible.');
      this.logout();
      return throwError(() => new Error('No hay refresh token.'));
    }
  
    return this.api.post<{ accessToken: string }>('auth/refresh-token', { refreshToken }).pipe(
      tap((response: any) => {
        this.tokenService.saveTokens(response.accessToken, refreshToken);
        this.updateAuthState(true);
  
        // 🚀 Notificar al WebSocket que el token ha cambiado
        console.log("🔄 Notificando al WebSocket que el token ha sido renovado.");
        this.websocketService.reconnectWithNewToken();
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
  
  

  // Inicializar el estado de autenticación al iniciar la app
  private initAuthState(): void {
    const isValid = this.tokenService.hasValidAccessToken();
    this.authStateSubject.next(isValid);
    if (isValid) {
      this.startTokenRefreshTimer();
    }
  }

  // Iniciar temporizador para renovar el token antes de que expire
  private startTokenRefreshTimer(): void {
    if (this.refreshTimer$) {
      console.warn("⏳ Cancelando temporizador previo de renovación.");
      this.refreshTimer$ = undefined;
    }
    const expiration = this.tokenService.getTokenExpiration();
    if (!expiration) return;
  
    const delay = (expiration - 60) * 1000; // Renovar 1 minuto antes de expirar
    this.refreshTimer$ = timer(delay).pipe(
      switchMap(() => this.refreshToken())
    );
  
    // 🚀 Este `subscribe()` hace que la renovación del token realmente se ejecute
    this.refreshTimer$.subscribe({
      next: () => console.log("🔄 Access token renovado automáticamente."),
      error: (error) => console.error("❌ Error al renovar el token:", error),
    });
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
