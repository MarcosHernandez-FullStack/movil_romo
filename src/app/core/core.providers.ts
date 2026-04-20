import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { loaderInterceptor } from './interceptors/loader.interceptor';
import { authInterceptor } from './interceptors/auth.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';

/**
 * Global providers that belong to the Core layer.
 * They are imported once in the root application configuration.
 */
export const CORE_PROVIDERS: EnvironmentProviders = makeEnvironmentProviders([
  provideHttpClient(withInterceptors([loaderInterceptor, authInterceptor, errorInterceptor])),
]);
