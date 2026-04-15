// Modelo de API para servicios de transporte
export interface ServiceApiModel {
  idServicio: number;
  nombreCliente: string;
  codeLabel: string;
  horaInicio: string;
  horaFinal: string;
  fecha: string;
  origenDireccion: string;
  coordLatOrigen: string;
  coordLonOrigen: string;
  destinoDireccion: string;
  coordLatDestino: string;
  coordLonDestino: string;
  distanciaKm: number;
  tiempoEstimadoMin: number;
  esLargaDistancia: boolean;
  estado: 'pendiente' | 'en-progreso' | 'completado' | 'cancelado';
  idUsuarioAsignado?: number;
  cantidadVehiculos: number;
  vehiculos: VehiculoTrasladoModel[];
  notas: string;

  hasArrived?: boolean;
}

export interface VehiculoTrasladoModel {
  placa: string;
  marca: string;
  modelo: string;
}

// Modelo de vista para la UI
export interface ServiceViewModel {
  id: number;
  clienteName: string;
  time: string;
  date: string;
  origin: string;
  destination: string;
  distance: number;
  estimatedTime: number;
  isLongDistance: boolean;
  status: string;
}

// Modelo de información del usuario para el header
export interface UserInfoViewModel {
  fullName: string;
  assignedServicesCount: number;
}
