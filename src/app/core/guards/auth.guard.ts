import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '@models/user.model';

/**
 * Auth Guard
 * Prevents access to routes if user is not authenticated
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated) {
    return true;
  }

  // Redirect to login with return URL
  router.navigate(['/auth/login'], {
    queryParams: { returnUrl: state.url },
  });
  return false;
};

/**
 * Guest Guard
 * Prevents authenticated users from accessing auth pages
 */
export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated) {
    return true;
  }

  // Redirect to dashboard based on role
  const user = authService.currentUserValue;
  if (user) {
    switch (user.role) {
      case UserRole.PATIENT:
        router.navigate(['/patient/dashboard']);
        break;
      case UserRole.DOCTOR:
        router.navigate(['/doctor/dashboard']);
        break;
      case UserRole.ADMIN:
        router.navigate(['/admin/dashboard']);
        break;
      default:
        router.navigate(['/']);
    }
  }
  return false;
};
