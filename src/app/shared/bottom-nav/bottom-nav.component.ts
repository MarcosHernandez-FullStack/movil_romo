import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './bottom-nav.component.html',
  styleUrls: ['./bottom-nav.component.scss'],
})
export class BottomNavComponent {
  navItems: NavItem[] = [
    { label: 'Mis Servicios', icon: 'bi-geo-alt', route: '/mobile/services' },
    // { label: 'Historial', icon: 'bi-clock', route: '/mobile/dashboard' },
    // { label: 'Historial', icon: 'bi-clock', route: '/mobile/history' },
    { label: 'Perfil', icon: 'bi-person', route: '/mobile/profile-mobile' },
  ];

  constructor(public router: Router) {}

  isActive(route: string): boolean {
    return this.router.url === route;
  }
}
