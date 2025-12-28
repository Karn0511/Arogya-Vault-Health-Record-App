import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '@models/user.model';

/**
 * Role Guard
 * Checks if user has required role to access route
 * Usage in route: canActivate: [roleGuard], data: { roles: [UserRole.PATIENT, UserRole.DOCTOR] }
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRoles = route.data['roles'] as UserRole[];
  const userRole = authService.userRole;

  if (!userRole) {
    router.navigate(['/auth/login']);
    return false;
  }

  if (requiredRoles && requiredRoles.includes(userRole)) {
    return true;
  }

  // Unauthorized - redirect to appropriate page
  router.navigate(['/unauthorized']);
  return false;
};
