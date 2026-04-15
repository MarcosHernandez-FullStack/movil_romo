import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { ServicesService } from '../../core/services/services.service';
import { ServiceApiModel } from '../../models/service.model';
import { ServiceCardComponent } from '../../shared/service-card/service-card.component';
import { HeaderComponent } from "../../shared/header/header.component";

type HistoryFilter = 'todos' | 'en-curso' | 'finalizados';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, ServiceCardComponent, HeaderComponent],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
})
export class HistoryComponent implements OnInit, OnDestroy {
  services: ServiceApiModel[] = [];
  visible: ServiceApiModel[] = [];

  filter: HistoryFilter = 'todos';

  private sub?: Subscription;

  constructor(private servicesService: ServicesService) {}

  ngOnInit(): void {
    this.sub = this.servicesService.services$.subscribe((list) => {
      this.services = (list ?? []).filter(
        (s) => s.estado === 'en-progreso' || s.estado === 'completado'
      );

      this.applyFilter();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  setFilter(f: HistoryFilter): void {
    this.filter = f;
    this.applyFilter();
  }

  get count(): number {
    return this.visible.length;
  }

  private applyFilter(): void {
    if (this.filter === 'todos') {
      this.visible = [...this.services];
      return;
    }

    if (this.filter === 'en-curso') {
      this.visible = this.services.filter((s) => s.estado === 'en-progreso');
      return;
    }

    this.visible = this.services.filter((s) => s.estado === 'completado');
  }
}