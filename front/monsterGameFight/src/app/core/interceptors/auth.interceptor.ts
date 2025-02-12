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

  // Clona la solicitud y añade el header Authorization si hay un token
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
      // Si obtenemos un 401 (token expirado), intentamos renovar el token
      if (error.status === 401 && localStorage.getItem('refreshToken')) {
        return authService.refreshToken().pipe(
          switchMap((response) => {
            // Extraemos el accessToken del response
            const newAccessToken = response.accessToken;

            // Actualiza el token en localStorage
            localStorage.setItem('accessToken', newAccessToken);

            // Crea una nueva solicitud con el token actualizado
            const refreshedRequest = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newAccessToken}`,
              },
            });

            // Vuelve a intentar la solicitud con el nuevo token
            return next(refreshedRequest);
          }),
          catchError((refreshError: HttpErrorResponse) => {
            // Si el refresh token falla, cerramos la sesión y redirigimos
            console.error('Error al renovar el token:', refreshError);
            authService.logout();
            router.navigate(['/auth/login']);
            return throwError(() => refreshError);
          })
        );
      }

      // Si no es un error 401, propagamos el error
      return throwError(() => error);
    })
  );
};
