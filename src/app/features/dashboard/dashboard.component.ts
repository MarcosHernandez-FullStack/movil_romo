import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

type SummaryCard = {
  label: string;
  value: string;
  helper: string;
  delta: string;
  trend: 'up' | 'down' | 'flat';
};

type QuickAction = {
  label: string;
  icon: string;
  description: string;
  command?: () => void;
};

type ActivityItem = {
  title: string;
  team: string;
  status: string;
  due: string;
};

type TicketItem = {
  id: string;
  subject: string;
  owner: string;
  priority: 'Alta' | 'Media' | 'Baja';
  updated: string;
};

type PerformancePoint = {
  label: string;
  value: number;
  target: number;
};

@Component({
  standalone: true,
  selector: 'admin-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  private readonly auth = inject(AuthService);

  readonly user = this.auth.user;

  private readonly numberFmt = new Intl.NumberFormat('es-ES');
  private readonly dateLabelFmt = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  readonly todayLabel = this.capitalize(
    this.stripAccents(this.dateLabelFmt.format(new Date()))
  );
  readonly lastUpdate = signal('Actualizado hace 12 minutos');

  readonly summaryCards: SummaryCard[] = [
    {
      label: 'Usuarios activos',
      value: this.numberFmt.format(1248),
      helper: 'ultimos 7 dias',
      delta: '+12%',
      trend: 'up',
    },
    {
      label: 'Tickets resueltos',
      value: this.numberFmt.format(327),
      helper: 'promedio diario',
      delta: '+6%',
      trend: 'up',
    },
    {
      label: 'Tiempo promedio de respuesta',
      value: '2m 40s',
      helper: 'menos que ayer',
      delta: '-8%',
      trend: 'down',
    },
    {
      label: 'Incidencias abiertas',
      value: this.numberFmt.format(18),
      helper: 'soporte nivel 2',
      delta: '3 nuevas',
      trend: 'flat',
    },
  ];

  readonly performanceMock: PerformancePoint[] = [
    { label: 'Lun', value: 68, target: 60 },
    { label: 'Mar', value: 74, target: 60 },
    { label: 'Mie', value: 71, target: 60 },
    { label: 'Jue', value: 63, target: 60 },
    { label: 'Vie', value: 78, target: 60 },
    { label: 'Sab', value: 52, target: 45 },
    { label: 'Dom', value: 48, target: 45 },
  ];

  readonly recentActivity: ActivityItem[] = [
    {
      title: 'Implementacion API de pagos',
      team: 'Equipo Backend',
      status: 'En curso',
      due: 'Hoy',
    },
    {
      title: 'Revision UI para onboarding',
      team: 'Producto + UX',
      status: 'Listo para QA',
      due: 'Manana',
    },
    {
      title: 'Capacitacion clientes retail',
      team: 'Experiencia Cliente',
      status: 'Programada',
      due: 'Jueves',
    },
  ];

  readonly serviceTickets: TicketItem[] = [
    { id: '#1823', subject: 'Restablecer acceso directivo', owner: 'Sofia M.', priority: 'Alta', updated: 'Hace 1 h' },
    { id: '#1820', subject: 'Migracion datos - etapa 2', owner: 'Equipo Infra', priority: 'Media', updated: 'Hace 3 h' },
    { id: '#1813', subject: 'Actualizacion app movil', owner: 'Lucas F.', priority: 'Alta', updated: 'Ayer' },
    { id: '#1802', subject: 'Solicitud licencias PowerBI', owner: 'Finanzas', priority: 'Media', updated: 'Ayer' },
  ];

  readonly systemHealth = {
    uptime: '99.98%',
    responseTime: '182 ms',
    incidents: 1,
  };

  readonly quickActions: QuickAction[] = [
    {
      label: 'Crear usuario',
      icon: 'bi-person-plus',
      description: 'Invita a un nuevo colaborador y asigna un rol de acceso.',
    },
    {
      label: 'Generar reporte',
      icon: 'bi-file-earmark-bar-graph',
      description: 'Descarga el consolidado semanal de metricas de servicio.',
    },
    {
      label: 'Cerrar session',
      icon: 'bi-box-arrow-right',
      description: 'Finaliza tu session de manera segura.',
      command: () => this.auth.logout(),
    },
  ];

  refreshData(): void {
    this.lastUpdate.set('Actualizado hace un momento');
  }

  handleAction(action: QuickAction): void {
    action.command?.();
  }

  private stripAccents(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  private capitalize(value: string): string {
    if (!value.length) return value;
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}
