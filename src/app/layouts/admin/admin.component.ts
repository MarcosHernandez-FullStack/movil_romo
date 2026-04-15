import { Component, HostListener, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NavSection, SidebarComponent } from '../../shared/sidebar/sidebar.component';

@Component({
  standalone: true,
  selector: 'app-admin',
  imports: [RouterOutlet, SidebarComponent],
  templateUrl: './admin.component.html',
})
export class AdminComponent {
  private router = inject(Router);
  private auth = inject(AuthService);

  sidebarOpen = false;
  profileMenuOpen = false;

  nav: NavSection[] = [
    {
      title: 'Navegacion',
      items: [
        { label: 'Dashboard', icon: 'bi-speedometer2', route: '/admin/dashboard' },
        { label: 'Perfil', icon: 'bi-person-circle', route: '/admin/profile' },
      ],
    },
    {
      title: 'Seguridad',
      items: [{ label: 'Usuarios', icon: 'bi-people', route: '/admin/users' }],
    },
    {
      title: 'Sesion',
      items: [
        {
          label: 'Cerrar sesion',
          icon: 'bi-box-arrow-right',
          command: () => this.logout(),
        },
      ],
    },
  ];

  get userInitials(): string {
    const user = this.auth.user;
    const base = (
      [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
      user?.username ||
      user?.email ||
      'U'
    ).trim();
    return base
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'U';
  }

  onNavigate(route?: string) {
    if (!route) {
      return;
    }
    this.router.navigateByUrl(route);
  }

  toggleProfileMenu() {
    this.profileMenuOpen = !this.profileMenuOpen;
  }

  closeProfileMenu() {
    this.profileMenuOpen = false;
  }

  goToProfile() {
    this.closeProfileMenu();
    this.router.navigateByUrl('/admin/profile');
  }

  logout() {
    this.closeProfileMenu();
    this.auth.logout();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-dropdown')) {
      this.profileMenuOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    this.closeProfileMenu();
  }
}
