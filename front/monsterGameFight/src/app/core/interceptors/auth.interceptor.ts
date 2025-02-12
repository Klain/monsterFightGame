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
          switchMap((response:any) => {
            const newAccessToken = response.accessToken;

            // Actualizar el token en localStorage
            localStorage.setItem('accessToken', newAccessToken);

            // Clonar la solicitud original con el nuevo token
            const refreshedRequest = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newAccessToken}`,
              },
            });

            // Reintentar la solicitud original con el token renovado
            return next(refreshedRequest);
          }),
          catchError((refreshError: HttpErrorResponse) => {
            console.error('Error al renovar el token:', refreshError);
            authService.logout();
            router.navigate(['/auth/login']);
            return throwError(() => refreshError);
          })
        );
      }

      // Otros errores (403, 500, etc.)
      if (error.status !== 401) {
        console.error('Error en la solicitud HTTP:', error);
      }

      return throwError(() => error);
    })
  );
};
