import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfileMobileComponent } from './profile-mobile/profile-mobile.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: 'profile',
        loadComponent: () => import('./profile/profile.component').then((m) => m.ProfileComponent),
      },
      {
        path: 'users',
        children: [
          {
            path: '',
            pathMatch: 'full',
            loadComponent: () =>
              import('./users/index/users-index.component').then((m) => m.UsersIndexComponent),
          },
        ],
      },
      {
        path: 'services',
        loadComponent: () =>
          import('./services/services.component').then((m) => m.ServicesComponent),
      },
      {
        path: 'profile-mobile',
        loadComponent: () =>
          import('./profile-mobile/profile-mobile.component').then((m) => m.ProfileMobileComponent),
      },
      // {
      //   path: 'history',
      //   loadComponent: () => import('./history/history.component').then((m) => m.HistoryComponent),
      // },
      {
        path: 'services/:idServicio',
        loadComponent: () =>
          import('./service-detail/service-detail.component').then((m) => m.ServiceDetailComponent),
        data: { hideBottomNav: true } //Para ocultar la barra inferior
      },
      {
        path: 'services/:idServicio/finished',
        loadComponent: () =>
          import('./service-finished/service-finished.component').then(
            (m) => m.ServiceFinishedComponent
          ),
        data: { hideBottomNav: true }
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FeaturesRoutingModule {}
