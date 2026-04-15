import { ApplicationConfig } from '@angular/core';
import { provideRouter, RouteReuseStrategy, withRouterConfig } from '@angular/router';
import { routes } from './app.routes';
import { CORE_PROVIDERS } from './core/core.providers';
import { MobileReuseStrategy } from './core/strategies/mobile-reuse.strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withRouterConfig({ onSameUrlNavigation: 'reload' })),
    { provide: RouteReuseStrategy, useClass: MobileReuseStrategy },
    CORE_PROVIDERS,
  ],
};
