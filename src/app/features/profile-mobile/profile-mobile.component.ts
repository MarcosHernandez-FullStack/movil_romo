import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile-mobile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-mobile.component.html',
  styleUrls: ['./profile-mobile.component.scss'],
})
export class ProfileMobileComponent {
  private auth = inject(AuthService);

  get user() {
    return this.auth.user;
  }

  get nombreCompleto(): string {
    const u = this.user;
    if (!u) return '';
    return `${u.firstName} ${u.lastName}`.trim();
  }

  get idLabel(): string {
    const u = this.user;
    if (!u) return '';
    return u.idOperador ? `OP-${String(u.idOperador).padStart(3, '0')}` : String(u.id);
  }

  get fecVenLicFormateada(): string {
    const raw = this.user?.fecVenLic;
    if (!raw) return '—';
    const [year, month, day] = raw.split('-');
    return `${day}/${month}/${year}`;
  }

  get isLicenciaVigente(): boolean {
    const raw = this.user?.fecVenLic;
    if (!raw) return false;
    return new Date(raw) >= new Date(new Date().toDateString());
  }

  cerrarSesion(): void {
    this.auth.logout();
  }
}
