import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  console.log("🔑 Interceptor activo: Token encontrado:", token);

  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log("📡 Petición modificada con Authorization:", clonedRequest);
    return next(clonedRequest);
  }

  return next(req);
};
