// src/app/core/interceptors/loader.interceptor.ts
import {
  HttpContextToken,
  HttpEvent,
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, finalize } from 'rxjs';
import { LoaderService } from '../services/loader.service';

export const SKIP_LOADER = new HttpContextToken<boolean>(() => false);

export const loaderInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const loader = inject(LoaderService);

  const isAsset = req.url.includes('/assets/');
  const skip = req.context.get(SKIP_LOADER) || isAsset;

  if (!skip) loader.start();

  return next(req).pipe(
    finalize(() => {
      if (!skip) loader.stop();
    })
  );
};
