import { Component, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ServicesService } from '../../core/services/services.service';
import { ServiceApiModel } from '../../models/service.model';

@Component({
  selector: 'app-service-finished',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './service-finished.component.html',
  styleUrls: ['./service-finished.component.scss'],
})
export class ServiceFinishedComponent {
  private route = inject(ActivatedRoute);
  private servicesService = inject(ServicesService);
  private location = inject(Location);
  private router = inject(Router);

  service?: ServiceApiModel;

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('idServicio');
    const idServicio = idParam ? Number(idParam) : NaN;

    this.servicesService.getServiceById(idServicio).subscribe((s) => {
      this.service = s;
    });
  }

  back(): void {
    this.router.navigateByUrl('/mobile/services');
  }
}