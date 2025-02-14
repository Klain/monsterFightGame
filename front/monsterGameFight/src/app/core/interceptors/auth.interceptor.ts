//front\monsterGameFight\src\app\core\interceptors\auth.interceptor.ts
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const accessToken = localStorage.getItem('accessToken');

  // Clonar la solicitud y añadir el header Authorization si hay un token
  let clonedRequest = req;
  if (accessToken) {
    clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && localStorage.getItem('refreshToken')) {
        console.warn('Access token expirado. Intentando renovar...');

        // Intentar renovar el token
        return authService.refreshToken().pipe(
          switchMap((response: any) => {
            const newAccessToken = response.accessToken;
            localStorage.setItem('accessToken', newAccessToken);
            const refreshedRequest = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newAccessToken}`,
              },
            });
            return next(refreshedRequest);
          }),
          catchError((refreshError: HttpErrorResponse) => {
            if (refreshError.error?.error === 'invalid_refresh_token') {
              console.warn('El refresh token ha expirado. Cerrando sesión.');
              authService.logout();
              router.navigate(['/auth/login']);
            } else {
              console.error('Error al renovar el token:', refreshError);
            }
            return throwError(() => refreshError);
          })
        );
      }

      if (error.status !== 401) {
        console.error('Error en la solicitud HTTP:', error);
      }

      return throwError(() => error);
    })
  );
};
