import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { LoginResponse, Session, SessionUser } from '../../models/auth.model';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private storageKey = 'auth.session';
  private _session = signal<Session | null>(this.loadFromStorage());
  get token(): string | null {
    return this._session()?.token ?? null;
  }
  get user(): SessionUser | null {
    return this._session()?.user ?? null;
  }
  get isAuthenticated(): boolean {
    return !!this.token;
  }
  get role(): string | null {
    return this.user?.role ?? null;
  }

  login(identificador: string, contrasena: string): Observable<LoginResponse> {
    const url = `${environment.apiUrl}/api/Auth/login`;
    return this.http
      .post<LoginResponse>(url, { identificador, contrasena })
      .pipe(tap((res) => this.setSessionFromApi(res)));
  }

  loginWithGoogle(credential: string): Observable<LoginResponse> {
    const url = `${environment.apiUrl}/api/login/google`;
    return this.http
      .post<LoginResponse>(url, { idToken: credential })
      .pipe(tap((res) => this.setSessionFromApi(res)));
  }

  logout() {
    this._session.set(null);
    this.saveToStorage(null);
    this.router.navigateByUrl('/login');
  }

  private loadFromStorage(): Session | null {
    const store = this.storage;
    if (!store) return null;
    const raw = store.getItem(this.storageKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Session;
    } catch {
      return null;
    }
  }

  private saveToStorage(ses: Session | null) {
    const store = this.storage;
    if (!store) return;
    if (!ses) return store.removeItem(this.storageKey);
    store.setItem(this.storageKey, JSON.stringify(ses));
  }

  private setSessionFromApi(res: LoginResponse) {
    const ses: Session = {
      token: res.token,
      user: {
        id: res.user.idUsuario,
        role: res.user.Rol,
        username: res.user.usuario,
        firstName: res.user.nombres,
        lastName: res.user.apellidos,
        email: res.user.email,
        phone: res.user.telefono,
        roleId: res.user.idRolUsuario,
        idOperador: res.user.IdOperador ?? null,
      },
    };
    this._session.set(ses);
    this.saveToStorage(ses);
  }

  private get storage(): Storage | null {
    return typeof window !== 'undefined' ? window.localStorage : null;
  }

  hasRole(role: string) {
    return this.role === role || (this.user?.roles?.includes?.(role) ?? false);
  }

  hasAnyRole(roles: string[]) {
    return roles.some((r) => this.hasRole(r));
  }

  //metodo de prueba provisional
  loginMock() {
    const mockResponse: any = {
      token: 'fake-jwt-token',
      user: {
        idUsuario: 1,
        Rol: 'Administrador',
        usuario: 'jcarlos',
        nombres: 'Juan Carlos',
        apellidos: 'Pérez',
        email: 'jcarlos@ejemplo.com',
        telefono: '999888777',
        idRolUsuario: 1,
      },
    };
    this.setSessionFromApi(mockResponse);
  }
}
