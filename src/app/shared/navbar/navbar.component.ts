import { Component, HostListener, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIf],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  open = false;
  userMenu = false;

  get displayName(): string {
    const u = this.auth.user;
    if (!u) return 'Invitado';
    const name = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
    return name || u.username || u.email || 'Usuario';
  }

  get initials(): string {
    const u = this.auth.user;
    const base = (
      [u?.firstName, u?.lastName].filter(Boolean).join(' ') ||
      u?.username ||
      u?.email ||
      'U'
    ).trim();
    return base
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'U';
  }

  toggle() {
    this.open = !this.open;
  }

  closeAll() {
    this.open = false;
    this.userMenu = false;
  }

  toggleUserMenu() {
    this.userMenu = !this.userMenu;
  }

  goToProfile() {
    this.closeAll();
    this.router.navigateByUrl('/admin/profile');
  }

  onLogout() {
    this.closeAll();
    this.auth.logout();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-dropdown')) {
      this.userMenu = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    this.closeAll();
  }
}
