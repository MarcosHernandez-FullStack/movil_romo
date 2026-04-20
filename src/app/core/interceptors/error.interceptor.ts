import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';

const MENSAJES: Record<number, string> = {
  429: 'Demasiadas solicitudes. Espere un momento e intente nuevamente.',
  504: 'El servidor tardó demasiado en responder. Intente nuevamente.',
  403: 'No tiene permisos para realizar esta acción.',
};

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router  = inject(Router);
  const auth    = inject(AuthService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        auth.logout();
        router.navigate(['/login']);
        return throwError(() => err);
      }

      const mensaje = MENSAJES[err.status];
      if (mensaje) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: mensaje,
          confirmButtonText: 'Aceptar',
        });
      }

      return throwError(() => err);
    })
  );
};
