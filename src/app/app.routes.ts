import { Routes } from '@angular/router';
import { canActivateAuthRole, canMatchAuthRole } from './core/guards/auth.guard';
import { AdminComponent } from './layouts/admin/admin.component';
import { MobileLayoutComponent } from './layouts/mobile-layout/mobile-layout.component';
export const routes: Routes = [
  {
    path: 'login',

    loadChildren: () =>
      import('./layouts/authentication/authentication.module').then(
        (module) => module.AuthenticationModule,
      ),
  },

  {
    path: 'admin',
    component: AdminComponent,
    canMatch: [canMatchAuthRole],
    canActivate: [canActivateAuthRole],
    loadChildren: () =>
      import('./features/features.module').then((module) => module.FeaturesModule),
  },
  {
    path: 'mobile',
    component: MobileLayoutComponent,
    canMatch: [canMatchAuthRole],
    canActivate: [canActivateAuthRole], // ← Agregar esto también
    loadChildren: () => import('./features/features.module').then((m) => m.FeaturesModule),
  },

  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
