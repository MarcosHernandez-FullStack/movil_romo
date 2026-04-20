import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ServiceApiModel, UserInfoViewModel } from '../../models/service.model';
import { ServicesService } from '../../core/services/services.service';

import { HeaderComponent } from '../../shared/header/header.component';
import { ServiceCardComponent } from '../../shared/service-card/service-card.component';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, HeaderComponent, ServiceCardComponent],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss'],
})
export class ServicesComponent implements OnInit {
  userInfo: UserInfoViewModel = { fullName: '', assignedServicesCount: 0 };

  services: ServiceApiModel[] = [];
  activeService?: ServiceApiModel;

  upcomingServices: ServiceApiModel[] = [];
  completedServices: ServiceApiModel[] = [];
  visibleServices: ServiceApiModel[] = [];

  isLoading = true;

  selectedDate: string = this.toDateInput(new Date());

  get dateLabel(): string {
    const today = this.toDateInput(new Date());
    if (this.selectedDate === today) return 'Hoy';
    const [y, m, d] = this.selectedDate.split('-');
    const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
    return `${parseInt(d)} ${meses[parseInt(m) - 1]} ${y}`;
  }

  constructor(private servicesService: ServicesService) {}

  ngOnInit(): void {
    this.loadData();
  }

  onDateChange(value: string): void {
    this.selectedDate = value;
    this.loadData();
  }

  private toDateInput(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private loadData(): void {
    this.servicesService.getUserInfo().subscribe({
      next: (data) => (this.userInfo = data),
      error: (err) => console.error('Error cargando usuario:', err),
    });

    this.isLoading = true;
    this.servicesService.getServices(this.selectedDate).subscribe({
      next: (data) => {
        this.services = data ?? [];
        this.isLoading = false;

        this.userInfo = { ...this.userInfo, assignedServicesCount: this.services.length };

        this.activeService = this.services.find((s) => s.estado === 'en-progreso');

        this.upcomingServices  = this.services.filter((s) => s.estado === 'pendiente');
        this.completedServices = this.services.filter((s) => s.estado === 'completado');

        // this.currentPage = Math.min(this.currentPage, this.totalPages);
        // this.currentPage = Math.max(this.currentPage, 1);
        // this.applyPagination();
      },
      error: (err) => {
        console.error('Error cargando servicios:', err);
        this.isLoading = false;
      },
    });
  }

  get hasActiveService(): boolean {
    return !!this.activeService;
  }

  get totalItems(): number {
    return this.upcomingServices.length;
  }

  // get totalPages(): number {
  //   return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  // }

  // get pages(): number[] {
  //   const maxVisible = 5;
  //   const total = this.totalPages;

  //   if (total <= maxVisible) {
  //     return Array.from({ length: total }, (_, i) => i + 1);
  //   }

  //   let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
  //   let end = start + maxVisible - 1;

  //   if (end > total) {
  //     end = total;
  //     start = end - maxVisible + 1;
  //   }

  //   return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  // }

  // private applyPagination(): void {
  //   const start = (this.currentPage - 1) * this.pageSize;
  //   const end = start + this.pageSize;
  //   this.visibleServices = this.upcomingServices.slice(start, end);
  // }

  // goToPage(page: number): void {
  //   const clamped = Math.min(Math.max(page, 1), this.totalPages);
  //   if (clamped === this.currentPage) return;

  //   this.currentPage = clamped;
  //   this.applyPagination();
  //   window.scrollTo({ top: 0, behavior: 'smooth' });
  // }

  // prevPage(): void {
  //   this.goToPage(this.currentPage - 1);
  // }

  // nextPage(): void {
  //   this.goToPage(this.currentPage + 1);
  // }
}