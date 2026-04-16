import { ChangeDetectorRef, Component, inject, NgZone, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ServicesService, OperacionResult } from '../../core/services/services.service';
import { ServiceApiModel } from '../../models/service.model';
import { HeaderComponent } from "../../shared/header/header.component";
import { FormsModule } from '@angular/forms';
import { Geolocation, PermissionStatus } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

type GpsApp = 'waze' | 'googlemaps';
type NavPoint = 'origen' | 'destino';

type GpsCoords = { lat: number; lng: number; accuracy?: number };

@Component({
  selector: 'app-service-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FormsModule],
  templateUrl: './service-detail.component.html',
  styleUrls: ['./service-detail.component.scss'],
})
export class ServiceDetailComponent implements OnDestroy {
  private zone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);
  private location = inject(Location);
  private route = inject(ActivatedRoute);
  private servicesService = inject(ServicesService);


  service?: ServiceApiModel;

  isNavModalOpen = false;

  private endsAt = 0;
  private timer?: ReturnType<typeof setTimeout>;

  navPoint: NavPoint = 'destino';
  isFinishModalOpen = false;
  finishConfirmed = false;

  isCheckingFinish = false;
  finishCheckError?: string;
  isFarModalOpen = false;
  distanceToDestMeters?: number;

  isResultModalOpen = false;
  resultSuccess = false;
  resultMessage = '';
  resultContext: 'iniciar' | 'finalizar' = 'iniciar';
  isStarting = false;

  private onVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      this.resyncTimer();
    }
  };

  constructor() {
    document.addEventListener('visibilitychange', this.onVisibilityChange);

    const idParam = this.route.snapshot.paramMap.get('idServicio');
    const idServicio = idParam ? Number(idParam) : NaN;

    this.servicesService.getServiceById(idServicio).subscribe({
      next: (svc) => (this.service = svc),
      error: (err) => console.error('Error cargando servicio:', err),
    });
  }

  ngOnDestroy(): void {
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    if (this.timer) clearTimeout(this.timer);
  }

  back(): void {
    this.location.back();
  }

  get estadoLabel(): string {
    if (!this.service) return '';
    const map: Record<ServiceApiModel['estado'], string> = {
      pendiente: 'Pendiente',
      'en-progreso': 'En Curso',
      completado: 'Completado',
      cancelado: 'Cancelado',
    };
    return map[this.service.estado];
  }

  get hasArrived(): boolean {
    return !!this.service?.hasArrived;
  }

  openNavModal(point: NavPoint): void {
    this.navPoint = point;
    this.isNavModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeNavModal(): void {
    this.isNavModalOpen = false;
    document.body.style.overflow = '';
  }

  private startArriveSimulation(ms = 3000): void {
    if (!this.service) return;

    if (this.timer) clearTimeout(this.timer);

    this.endsAt = Date.now() + ms;
    this.resyncTimer();
  }

  private resyncTimer(): void {
    if (!this.service) return;

    if (this.timer) clearTimeout(this.timer);

    const remaining = this.endsAt - Date.now();
    if (remaining <= 0) {
      this.servicesService.markArrived(this.service.idServicio);
      this.timer = undefined;
      return;
    }

    this.timer = setTimeout(() => {
      if (!this.service) return;
      this.servicesService.markArrived(this.service.idServicio);
      this.timer = undefined;
    }, remaining);
  }

  selectGps(app: GpsApp): void {
    if (!this.service) return;

    const isOrigen = this.navPoint === 'origen';

    const lat = isOrigen ? this.service.coordLatOrigen : this.service.coordLatDestino;
    const lon = isOrigen ? this.service.coordLonOrigen : this.service.coordLonDestino;

    let url: string;

    if (lat && lon) {
      url = app === 'googlemaps'
        ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=driving`
        : `https://waze.com/ul?ll=${lat},${lon}&navigate=yes`;
    } else {
      const address = encodeURIComponent(
        isOrigen ? (this.service.origenDireccion ?? '') : (this.service.destinoDireccion ?? '')
      );
      url = app === 'googlemaps'
        ? `https://www.google.com/maps/dir/?api=1&destination=${address}&travelmode=driving`
        : `https://waze.com/ul?q=${address}&navigate=yes`;
    }

    this.closeNavModal();
    window.open(url, '_blank');
  }

  startServiceOnly(): void {
    if (!this.service || this.isStarting) return;

    this.isStarting = true;

    this.servicesService.iniciarServicioApi(this.service.idServicio).subscribe({
      next: (res: OperacionResult) => {
        this.isStarting = false;
        if (res.exitoso === 1) {
          this.servicesService.startService(this.service!.idServicio);
          this.openResultModal(true, res.mensaje);
        } else {
          this.openResultModal(false, res.mensaje);
        }
      },
      error: (err) => {
        this.isStarting = false;
        const msg = err?.error?.mensaje || 'Ocurrió un error al iniciar el servicio';
        this.openResultModal(false, msg);
      },
    });
  }

  openResultModal(success: boolean, message: string, context: 'iniciar' | 'finalizar' = 'iniciar'): void {
    this.resultSuccess = success;
    this.resultMessage = message;
    this.resultContext = context;
    this.isResultModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeResultModal(): void {
    this.isResultModalOpen = false;
    document.body.style.overflow = '';
  }

  goToOrigin(): void{
    this.openNavModal('origen');
  }

  goToDestination(): void{
    this.openNavModal('destino');
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
  private calculateDistanceMeters(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {

    const R = 6371000; // Radio de la Tierra en metros

    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);

    const radLat1 = this.toRadians(lat1);
    const radLat2 = this.toRadians(lat2);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(radLat1) *
        Math.cos(radLat2) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  openFarModal(distance: number): void {
    const rounded = Math.round(distance);
     this.zone.run(() => {
      this.distanceToDestMeters = rounded;
      if (!this.isFarModalOpen) {
        this.isFarModalOpen = true;
        document.body.style.overflow = 'hidden';
      }
      this.cdr.detectChanges();
    });
  }

  closeFarModal(): void {
    this.isFarModalOpen = false;
    document.body.style.overflow = '';
  }

  async openFinishModal(): Promise<void> {
    if (this.isCheckingFinish) return;
    this.isCheckingFinish = true;
    this.finishCheckError = undefined;
    document.body.style.overflow = 'hidden';
   
    try {
    const coords = await this.getCurrentPosition();

    const destLat = parseFloat(this.service?.coordLatDestino ?? '0');
    const destLng = parseFloat(this.service?.coordLonDestino ?? '0');

    const distance = this.calculateDistanceMeters(
      destLat,
      destLng,
      coords.lat,
      coords.lng
    );

    // console.log('Distancia en metros:', coords);

    this.zone.run(() => {
      if (distance <= 200) {
        this.finishConfirmed = false;
        this.isFinishModalOpen = true;
        document.body.style.overflow = 'hidden';
      } else {
        this.openFarModal(distance);
      }
    });

  } catch (e: any) {
    this.finishCheckError = e?.message ?? 'No se pudo validar tu ubicación.';
    alert(this.finishCheckError);
  }finally{
    this.zone.run(() => {
      this.isCheckingFinish = false;
      if (!this.isFinishModalOpen && !this.isFarModalOpen) {
        document.body.style.overflow = '';
      }
      this.cdr.detectChanges();
    });
  }
    // this.finishConfirmed = false;
    // this.isFinishModalOpen = true;
    // document.body.style.overflow = 'hidden';
  }

  private async getCurrentPosition(options?: PositionOptions): Promise<GpsCoords> {
    if (Capacitor.isNativePlatform()) {
      let permission: PermissionStatus = await Geolocation.checkPermissions();

      if (permission.location !== 'granted') {
        permission = await Geolocation.requestPermissions();
        if (permission.location !== 'granted') {
          throw new Error('Permiso de ubicación denegado. Habilítalo en la configuración del teléfono.');
        }
      }

      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 12000,
      });

      return {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      };
    }

    return new Promise<GpsCoords>((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        reject(new Error('Geolocalización no soportada en este navegador.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.zone.run(() => {
            resolve({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
            });
          });
        },
        (err) => {
          let msg = 'No se pudo obtener tu ubicación.';
          if (err.code === err.PERMISSION_DENIED) msg = 'Permiso de ubicación denegado.';
          if (err.code === err.POSITION_UNAVAILABLE) msg = 'Ubicación no disponible.';
          if (err.code === err.TIMEOUT) msg = 'Tiempo de espera agotado al obtener ubicación.';
          reject(new Error(msg));
        },
        {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 0,
          ...(options ?? {}),
        }
      );
    });
  }

  closeFinishModal(): void {
    this.isFinishModalOpen = false;
    document.body.style.overflow = '';
  }

  isFinishing = false;

  confirmFinish(): void {
    if (!this.service || !this.finishConfirmed || this.isFinishing) return;

    this.isFinishing = true;

    this.servicesService.finalizarServicioApi(this.service.idServicio).subscribe({
      next: (res: OperacionResult) => {
        this.isFinishing = false;
        this.closeFinishModal();
        if (res.exitoso === 1) {
          this.servicesService.finishService(this.service!.idServicio);
          this.openResultModal(true, res.mensaje, 'finalizar');
        } else {
          this.openResultModal(false, res.mensaje, 'finalizar');
        }
      },
      error: (err) => {
        this.isFinishing = false;
        this.closeFinishModal();
        const msg = err?.error?.mensaje || 'Ocurrió un error al finalizar el servicio';
        this.openResultModal(false, msg, 'finalizar');
      },
    });
  }
}