import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface UserProfile {
  nombre: string;
  id: string;
  alias: string;
  telefono: string;
  serviciosCompletados: number;
  kilometrosTotales: number;
}

interface VehiculoAsignado {
  placa: string;
  modelo: string;
  marca: string;
  ano: number;
}

interface LicenciaConducir {
  numero: string;
  categoria: string;
  vencimiento: string;
}

@Component({
  selector: 'app-profile-mobile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-mobile.component.html',
  styleUrls: ['./profile-mobile.component.scss'],
})
export class ProfileMobileComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);

  userProfile: UserProfile = {
    nombre: 'Juan Carlos Pérez',
    id: 'OP001',
    alias: 'JCARLOS',
    telefono: '+51 987 654 321',
    serviciosCompletados: 0,
    kilometrosTotales: 0,
  };

  vehiculo: VehiculoAsignado = {
    placa: 'ABC-123',
    modelo: 'Hiace',
    marca: 'Toyota',
    ano: 2022,
  };

  licencia: LicenciaConducir = {
    numero: 'Q87654321',
    categoria: 'A-IIb',
    vencimiento: '14/08/2027',
  };

  ngOnInit(): void {
  }

  cerrarSesion(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

}
