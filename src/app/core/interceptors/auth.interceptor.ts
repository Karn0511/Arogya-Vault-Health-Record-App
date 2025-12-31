import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Skip auth for certain endpoints
  if (
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/register') ||
    req.url.includes('/auth/google') ||
    req.url.includes('/auth/send-otp') ||
    req.url.includes('/auth/verify-otp') ||
    req.url.endsWith('/status') ||
    req.url.endsWith('/health')
  ) {
    return next(req);
  }

  // Use persisted JWT token instead of user UID
  const token = localStorage.getItem('token');

  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(authReq).pipe(
      catchError((error) => {
        if (error.status === 401) {
          // Token expired or invalid - logout user
          authService.signOut();
        }
        return throwError(() => error);
      })
    );
  }

  return next(req);
};
