import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

function check(requiredRoles?: string[]): boolean | UrlTree {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: router.url || '/' } });
  }
  if (!requiredRoles?.length) return true; // solo login
  return auth.hasAnyRole(requiredRoles) ? true : router.createUrlTree(['/403']);
}

export const canMatchAuthRole: CanMatchFn = (route, segments) => {
  const url = '/' + segments.map((s) => s.path).join('/');
  const roles = route.data?.['roles'] as string[] | undefined;
  return check(roles);
};

export const canActivateAuthRole: CanActivateFn = (route, state) => {
  const roles = route.data?.['roles'] as string[] | undefined;
  return check(roles);
};

