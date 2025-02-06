import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private api: ApiService, private router: Router) {}

  login(username: string, password: string): Observable<any> {
    return this.api.post('auth/login', { username, password }).pipe(
      catchError(this.handleAuthError.bind(this))
    );
  }

  register(username: string, password: string): Observable<any> {
    return this.api.post('auth/register', { username, password }).pipe(
      catchError(this.handleAuthError.bind(this))
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/auth/login']);
  }

  checkSession(): Observable<any> {
    return this.api.get('auth/check-session').pipe(
      catchError(this.handleAuthError.bind(this))
    );
  }

  private handleAuthError(error: HttpErrorResponse) {
    if (error.status === 401) {
      this.logout(); 
    }
    return throwError(() => error);
  }
}
