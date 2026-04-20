import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ApiUser } from '../../models/user.api.model';
import { UserView } from '../../models/user.view.model';

export interface UserRoleApi {
  idRolUsuario: number;
  rol: string;
}

type UserPayload = {
  idUsuario?: number;
  usuario: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: number | string | null;
  idRolUsuario?: number | null;
};

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/Usuario`;

  private toView(u: ApiUser): UserView {
    return {
      id: u.idUsuario,
      fullName: `${(u.nombres ?? '').trim()} ${(u.apellidos ?? '').trim()}`.trim(),
      email: u.email,
      role: u.Rol ?? '',
      username: u.usuario,
      phone: u.telefono,
      roleId: u.idRolUsuario,
    };
  }

  list(q?: string): Observable<UserView[]> {
    const term = (q ?? '').trim();
    const params = term ? new HttpParams().set('q', term) : undefined;

    return this.http
      .get<ApiUser[]>(this.base, { params })
      .pipe(map((arr) => arr.map((u) => this.toView(u))));
  }

  getById(id: number): Observable<UserView | null> {
    return this.http.get<ApiUser>(`${this.base}/${id}`).pipe(
      map((u) => this.toView(u)),
      catchError((err) => (err.status === 404 ? of(null) : throwError(() => err)))
    );
  }

  getRoles(): Observable<UserRoleApi[]> {
    return this.http.get<UserRoleApi[]>(`${this.base}/roles`);
  }

  /** POST /api/Usuario */
  createFromView(v: Partial<UserView>) {
    const { nombres, apellidos } = this.splitFullName(v.fullName ?? '');
    const payload = this.buildPayload({
      usuario: v.username ?? '',
      nombres,
      apellidos,
      email: v.email ?? '',
      telefono: v.phone ?? null,
      idRolUsuario: v.roleId ?? null,
    });
    return this.http.post<ApiUser>(this.base, payload).pipe(map((u) => this.toView(u)));
  }

  /** PUT /api/Usuario */
  updateFromView(id: number, v: Partial<UserView>) {
    const { nombres, apellidos } = this.splitFullName(v.fullName ?? '');
    const payload = this.buildPayload({
      idUsuario: id,
      usuario: v.username ?? '',
      nombres,
      apellidos,
      email: v.email ?? '',
      telefono: v.phone ?? null,
      idRolUsuario: v.roleId ?? null,
    });
    return this.http.put<ApiUser>(this.base, payload).pipe(map((u) => this.toView(u)));
  }

  /** DELETE /api/Usuario/{id} */
  remove(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  private splitFullName(fullName: string) {
    const parts = (fullName ?? '').trim().split(/\s+/);
    if (parts.length <= 1) {
      return { nombres: parts[0] ?? '', apellidos: '' };
    }
    const apellidos = parts.pop() as string;
    const nombres = parts.join(' ');
    return { nombres, apellidos };
  }

  private buildPayload(payload: UserPayload): UserPayload {
    const next: UserPayload = { ...payload };

    if (next.telefono == null || next.telefono === '') {
      delete next.telefono;
    }

    if (next.idRolUsuario == null) {
      delete next.idRolUsuario;
    }

    return next;
  }
}
