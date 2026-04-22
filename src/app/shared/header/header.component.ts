import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

type HeaderVariant = 'default' | 'history' | 'detail';

type ServiceStatus = 'pendiente' | 'en-progreso' | 'completado' | 'cancelado';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  @Input() title?: string;
  @Input() subtitle?: string;

  @Input() userName?: string;
  @Input() servicesCount?: number;

  @Input() variant: HeaderVariant = 'default';

  @Output() refresh = new EventEmitter<void>();

  isRefreshing = false;

  onRefresh(): void {
    if (this.isRefreshing) return;
    this.isRefreshing = true;
    this.refresh.emit();
    setTimeout(() => (this.isRefreshing = false), 1000);
  }

  @Input() serviceCode?: string;
  @Input() status?: ServiceStatus;

  get statusLabel(): string {
    const s = this.status;
    if (!s) return '';
    const map: Record<ServiceStatus, string> = {
      pendiente: 'Pendiente',
      'en-progreso': 'En curso',
      completado: 'Completado',
      cancelado: 'Cancelado',
    };
    return map[s];
  }

  get statusIconClass(): string {
    const s = this.status;
    if (!s) return '';
    const map: Record<ServiceStatus, string> = {
      pendiente: 'bi-clock',
      'en-progreso': 'bi-truck',
      completado: 'bi-check-circle-fill',
      cancelado: 'bi-x-circle-fill',
    };
    return map[s];
  }
}