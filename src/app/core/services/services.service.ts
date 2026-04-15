import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ServiceApiModel, UserInfoViewModel } from '../../models/service.model';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

type ServiceEstado = ServiceApiModel['estado'];

interface ReservaApi {
  Id:               number;
  DireccionOrigen:  string;
  CoordLatOrigen:   string;
  CoordLonOrigen:   string;
  DireccionDestino: string;
  CoordLatDestino:  string;
  CoordLonDestino:  string;
  CantidadCarga:    number;
  FechaServicio:    string;
  HoraInicio:       string;
  HoraFin:          string;
  DistanciaKm:      number;
  TiempoEstimado:   number;
  EstadoOperacion:  string;
  NombreCliente:    string | null;
  PlacaVehiculo:    string | null;
  MarcaVehiculo:    string | null;
  ModeloVehiculo:   string | null;
  NotasAdicionales: string | null;
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
    const fecha = new Date(r.FechaServicio);
    const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
    const fechaLabel = `${fecha.getDate()} ${meses[fecha.getMonth()]}`;

    const horaInicio = r.HoraInicio?.substring(0, 5) ?? '';
    const horaFinal  = r.HoraFin?.substring(0, 5) ?? '';

    const estado = this.mapEstado(r.EstadoOperacion);

    const vehiculos = r.PlacaVehiculo
      ? [{ placa: r.PlacaVehiculo, marca: r.MarcaVehiculo ?? '', modelo: r.ModeloVehiculo ?? '' }]
      : [];

    return {
      idServicio:       r.Id,
      codeLabel:        `SRV-${String(r.Id).padStart(3, '0')}`,
      nombreCliente:    r.NombreCliente ?? '',
      horaInicio,
      horaFinal,
      fecha:            fechaLabel,
      origenDireccion:  r.DireccionOrigen,
      coordLatOrigen:   r.CoordLatOrigen,
      coordLonOrigen:   r.CoordLonOrigen,
      destinoDireccion: r.DireccionDestino,
      coordLatDestino:  r.CoordLatDestino,
      coordLonDestino:  r.CoordLonDestino,
      distanciaKm:      r.DistanciaKm,
      tiempoEstimadoMin: r.TiempoEstimado,
      esLargaDistancia: false,
      estado,
      cantidadVehiculos: r.CantidadCarga,
      vehiculos,
      notas:            r.NotasAdicionales ?? '',
      hasArrived:       false,
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
