export interface LoginResponse {
  token: string;
  expiresAt: string;
  id: number;
  alias: string;
  nombres: string;
  apellidos: string;
  correo: string;
  telefono?: string | null;
  rol: string;
  idCliente?: number | null;
  idOperador?: number | null;
  tarifaKm?: number | null;
  tarifaBase?: number | null;
  empresa?: string | null;
  nroLicencia?: string | null;
  fecVenLic?: string | null;
  serviciosCompletados?: number | null;
}
export interface SessionUser {
  id: number;
  role: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  roleId: number;
  roles?: string[];
  idOperador?: number | null;
  nroLicencia?: string | null;
  fecVenLic?: string | null;
  serviciosCompletados?: number | null;
}

export interface Session {
  token: string;
  user: SessionUser;
}
