import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ServiceApiModel } from '../../models/service.model';

@Component({
  selector: 'app-service-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './service-card.component.html',
  styleUrls: ['./service-card.component.scss']
})
export class ServiceCardComponent {
  @Input() service!: ServiceApiModel;

  // ✅ SOLO el padre decide si está bloqueada
  @Input() isLocked = false;

  onCardClick(ev: MouseEvent) {
    if (this.isLocked) {
      ev.preventDefault();
      ev.stopPropagation();
    }
  }

  get showStatusPill(): boolean {
    return this.service?.estado !== 'pendiente';
  }

  get statusLabel(): string {
    const map: Record<ServiceApiModel['estado'], string> = {
      pendiente: '',
      'en-progreso': 'En Curso',
      completado: 'Finalizado',
      cancelado: 'Cancelado',
    };
    return map[this.service.estado];
  }

  get statusIconClass(): string {
    const map: Record<ServiceApiModel['estado'], string> = {
      pendiente: 'bi-clock',
      'en-progreso': 'bi-truck',
      completado: 'bi-check-circle-fill',
      cancelado: 'bi-x-circle-fill',
    };
    return map[this.service.estado] ?? '';
  }
}