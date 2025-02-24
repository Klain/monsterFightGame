import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError, filter, take, tap, BehaviorSubject, Observable } from 'rxjs';

const isRefreshing = new BehaviorSubject<boolean>(false);
let refreshTokenInProgress: Observable<any> | null = null;

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const tokenService = inject(TokenService);
  const router = inject(Router);

  const accessToken = tokenService.getAccessToken();
  let clonedRequest = req;

  if (accessToken) {
    clonedRequest = req.clone({
      setHeaders: { Authorization: `Bearer ${accessToken}` },
    });
  }

  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && tokenService.getRefreshToken()) {
        console.warn('Access token expirado. Intentando renovar...');

        if (!isRefreshing.getValue()) {
          isRefreshing.next(true);
          refreshTokenInProgress = authService.refreshToken().pipe(
            tap((response: any) => {
              tokenService.setAccessToken(response.accessToken);
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
          filter(token => token !== null),
          take(1),
          switchMap(() => {
            const newAccessToken = tokenService.getAccessToken();
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
