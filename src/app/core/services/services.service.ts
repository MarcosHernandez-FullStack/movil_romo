import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ServiceApiModel, UserInfoViewModel } from '../../models/service.model';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

type ServiceEstado = ServiceApiModel['estado'];

interface ReservaApi {
  id:               number;
  direccionOrigen:  string;
  coordLatOrigen:   string;
  coordLonOrigen:   string;
  direccionDestino: string;
  coordLatDestino:  string;
  coordLonDestino:  string;
  cantidadCarga:    number;
  fechaServicio:    string;
  horaInicio:       string;
  horaFin:          string;
  distanciaKm:      number;
  tiempoEstimado:   number;
  estadoOperacion:  string;
  nombreCliente:    string | null;
  placaVehiculo:    string | null;
  marcaVehiculo:    string | null;
  modeloVehiculo:   string | null;
  notasAdicionales: string | null;
}

@Injectable({ providedIn: 'root' })
export class ServicesService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private servicesSubject = new BehaviorSubject<ServiceApiModel[]>([]);
  services$ = this.servicesSubject.asObservable();

  private readonly apiUrl = `${environment.apiUrl}/api/Operaciones`;

  getServices(fechaServicio?: string): Observable<ServiceApiModel[]> {
    const idOperador = this.authService.user?.idOperador;

    let params = new HttpParams();
    if (idOperador)    params = params.set('idOperador',    idOperador.toString());
    if (fechaServicio) params = params.set('fechaServicio', fechaServicio);

    return this.http
      .get<ReservaApi[]>(this.apiUrl, { params })
      .pipe(
        map(reservas => reservas.map(r => this.mapToModel(r))),
        tap(servicios => this.servicesSubject.next(servicios))
      );
  }

  getServiceById(id: number): Observable<ServiceApiModel | undefined> {
    return this.services$.pipe(map(list => list.find(s => s.idServicio === id)));
  }

  getUserInfo(): Observable<UserInfoViewModel> {
    const user = this.authService.user;
    return of({
      fullName: user ? `${user.firstName} ${user.lastName}`.trim() : '',
      assignedServicesCount: this.servicesSubject.value.length,
    });
  }

  hasActiveService(): boolean {
    return this.servicesSubject.value.some(s => s.estado === 'en-progreso');
  }

  getActiveService(): ServiceApiModel | undefined {
    return this.servicesSubject.value.find(s => s.estado === 'en-progreso');
  }

  startService(idServicio: number): void {
    const next: ServiceApiModel[] = this.servicesSubject.value.map((s): ServiceApiModel => {
      if (s.estado === 'completado' || s.estado === 'cancelado') return s;

      if (s.idServicio === idServicio) {
        return { ...s, estado: 'en-progreso' as ServiceEstado, hasArrived: false };
      }

      if (s.estado === 'en-progreso') {
        return { ...s, estado: 'pendiente' as ServiceEstado, hasArrived: false };
      }

      return s;
    });

    this.servicesSubject.next(next);
  }

  markArrived(idServicio: number): void {
    this.patchService(idServicio, { hasArrived: true });
  }

  finishService(idServicio: number): void {
    this.patchService(idServicio, { estado: 'completado', hasArrived: false });
  }

  private patchService(idServicio: number, patch: Partial<ServiceApiModel>): void {
    const next = this.servicesSubject.value.map(s =>
      s.idServicio === idServicio ? { ...s, ...patch } : s
    );
    this.servicesSubject.next(next);
  }

  private mapToModel(r: ReservaApi): ServiceApiModel {
    const fecha = new Date(r.fechaServicio);
    const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
    const fechaLabel = `${fecha.getDate()} ${meses[fecha.getMonth()]}`;

    const horaInicio = r.horaInicio?.substring(0, 5) ?? '';
    const horaFinal  = r.horaFin?.substring(0, 5) ?? '';

    const estado = this.mapEstado(r.estadoOperacion);

    const vehiculos = r.placaVehiculo
      ? [{ placa: r.placaVehiculo, marca: r.marcaVehiculo ?? '', modelo: r.modeloVehiculo ?? '' }]
      : [];

    return {
      idServicio:        r.id,
      codeLabel:         `SRV-${String(r.id).padStart(3, '0')}`,
      nombreCliente:     r.nombreCliente ?? '',
      horaInicio,
      horaFinal,
      fecha:             fechaLabel,
      origenDireccion:   r.direccionOrigen,
      coordLatOrigen:    r.coordLatOrigen,
      coordLonOrigen:    r.coordLonOrigen,
      destinoDireccion:  r.direccionDestino,
      coordLatDestino:   r.coordLatDestino,
      coordLonDestino:   r.coordLonDestino,
      distanciaKm:       r.distanciaKm,
      tiempoEstimadoMin: r.tiempoEstimado,
      esLargaDistancia:  false,
      estado,
      cantidadVehiculos: r.cantidadCarga,
      vehiculos,
      notas:             r.notasAdicionales ?? '',
      hasArrived:        false,
    };
  }

  private mapEstado(estadoOperacion: string): ServiceEstado {
    switch (estadoOperacion?.toUpperCase()) {
      case 'ENCURSO':    return 'en-progreso';
      case 'FINALIZADO': return 'completado';
      case 'CANCELADO':  return 'cancelado';
      default:           return 'pendiente';
    }
  }
}
