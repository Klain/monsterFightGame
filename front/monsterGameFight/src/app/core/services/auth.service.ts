//front\monsterGameFight\src\app\core\services\auth.service.ts
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, catchError, throwError, tap } from 'rxjs';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authStateSubject = new BehaviorSubject<boolean>(this.hasValidAccessToken());
  authState$ = this.authStateSubject.asObservable();

  constructor(private api: ApiService, private router: Router) {}

  login(username: string, password: string): Observable<any> {
    return this.api.post('auth/login', { username, password }).pipe(
      tap((response: any) => {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        this.updateAuthState(true);
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
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.updateAuthState(false);
    this.router.navigate(['/auth/login']);
  }

  refreshToken(): Observable<string> {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.api.post<{ accessToken: string }>('auth/refresh-token', { refreshToken }).pipe(
      tap((response: any) => {
        localStorage.setItem('accessToken', response.accessToken);
        this.updateAuthState(true);
      }),
      catchError((error: any) => {
        console.error('Error al refrescar token:', error);
        this.logout();
        return throwError(() => error);
      })
    );
  }

  isAuthenticated(): boolean {
    return this.authStateSubject.getValue();
  }

  private hasValidAccessToken(): boolean {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return false;

    const tokenData = this.decodeToken(accessToken);
    const currentTime = Math.floor(Date.now() / 1000);
    return tokenData?.exp > currentTime;
  }

  private updateAuthState(isAuthenticated: boolean): void {
    this.authStateSubject.next(isAuthenticated);
  }

  private decodeToken(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }

  private handleAuthError(error: HttpErrorResponse) {
    if (error.status === 401) {
      this.logout();
    }
    return throwError(() => error);
  }
}
