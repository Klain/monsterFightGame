//front\monsterGameFight\src\app\core\interceptors\auth.interceptor.ts
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { BehaviorSubject,Observable,tap } from 'rxjs';

const isRefreshing = new BehaviorSubject<boolean>(false);
let refreshTokenInProgress: Observable<any> | null = null;

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const accessToken = localStorage.getItem('accessToken');
  let clonedRequest = req;
  if (accessToken) {
    clonedRequest = req.clone({
      setHeaders: { Authorization: `Bearer ${accessToken}` },
    });
  }

  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && localStorage.getItem('refreshToken')) {
        console.warn('Access token expirado. Intentando renovar...');

        if (!isRefreshing.getValue()) {
          isRefreshing.next(true);
          refreshTokenInProgress = authService.refreshToken().pipe(
            tap((response: any) => {
              localStorage.setItem('accessToken', response.accessToken);
              isRefreshing.next(false);
              refreshTokenInProgress = null;
            }),
            catchError((refreshError: HttpErrorResponse) => {
              console.warn('El refresh token ha expirado. Cerrando sesión.');
              authService.logout();
              router.navigate(['/auth/login']);
              isRefreshing.next(false);
              refreshTokenInProgress = null;
              return throwError(() => refreshError);
            })
          );
        }

        return refreshTokenInProgress!.pipe(
          switchMap(() => {
            const newAccessToken = localStorage.getItem('accessToken');
            const refreshedRequest = req.clone({
              setHeaders: { Authorization: `Bearer ${newAccessToken}` },
            });
            return next(refreshedRequest);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
