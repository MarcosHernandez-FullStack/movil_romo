# ROMO — App Móvil de Operadores

Aplicación Angular + Capacitor para el sistema **ROMO**. Ofrece dos portales sobre la misma base de código: una **app Android** para operadores de grúa (gestión de servicios con GPS) y un **panel web** para administradores (gestión de usuarios y dashboard).

---

## Arquitectura de la aplicación

El proyecto organiza el código en capas con componentes standalone:

```
src/app/
├── core/      → Guards, interceptores y servicios de alcance global
├── features/  → Módulos de negocio compartidos por ambos portales (lazy-loaded)
├── shared/    → Componentes reutilizables (tabla, modal, loader, tarjetas)
├── layouts/   → Shells de navegación: admin (sidebar), mobile (bottom nav), login
└── models/    → Interfaces TypeScript por dominio
```

El mismo módulo `features` sirve a las rutas `/admin/*` y `/mobile/*`. El layout que se renderiza depende del portal al que accede el usuario según su rol.

---

## Stack tecnológico

| Área              | Tecnología                                     |
|-------------------|------------------------------------------------|
| Framework         | Angular 20 (standalone components)             |
| Estilos           | Bootstrap 5.3 + Bootstrap Icons + SCSS         |
| Mobile (APK)      | Capacitor 8 — Android (min SDK 24, target 36)  |
| GPS               | `@capacitor/geolocation`                       |
| Alertas           | SweetAlert2                                    |
| Auth extra        | Google OAuth 2.0 (solo portal admin web)       |
| SSR               | Express 5 + `@angular/ssr`                     |
| Testing           | Karma + Jasmine                                |
| Lenguaje          | TypeScript 5.9 (strict mode)                   |

---

## Requisitos previos

### Desarrollo web
- [Node.js](https://nodejs.org/) 22
- npm ≥ 10.8
- Angular CLI 20: `npm install -g @angular/cli`

### Build Android (APK)
- [Android Studio](https://developer.android.com/studio) con Android SDK
- SDK Platform 36 (Android 16), min SDK 24 instalado
- Capacitor CLI: incluido en devDependencies (`npx cap`)
- Variables `ANDROID_HOME` / `JAVA_HOME` configuradas en el sistema

---

## Configuración de entornos

Los archivos de entorno están en `src/environments/`:

**`environment.ts`** — Build por defecto (producción)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5016/api',
  // apiUrl: 'https://ca-back-romo.whitedesert-ca97fbc6.eastus2.azurecontainerapps.io/api',
  googleClientId: '498361177128-...',
};
```

**`environment.development.ts`** — `ng serve` en desarrollo

> Descomenta la línea de Azure en `apiUrl` para apuntar a producción.  
> `googleClientId` es requerido para el login con Google en el portal admin web.

---

## Roles y portales

El sistema maneja un único flujo de autenticación JWT con redirección automática según el rol:

| Rol | Portal | Layout | Login |
|-----|--------|--------|-------|
| `ADMINISTRADOR` | `/admin` | Sidebar + header | Email/pass o Google OAuth |
| `OPERADOR` | `/mobile` | Bottom nav | Usuario + password (sin Google) |

El guard `canMatch` + `canActivate` valida el rol antes de activar cada rama de rutas. Si la sesión no existe o expiró, redirige a `/login`.

**Sesión:** se almacena en `localStorage` bajo la clave `auth.session` como `{ token, user }`.

---

## Módulos del sistema

### Portal Administrador (`/admin`)

| Ruta | Descripción |
|------|-------------|
| `/admin/dashboard` | Widgets de KPIs, gráficos y acciones rápidas |
| `/admin/users` | Listado, alta, edición y baja de usuarios del sistema |
| `/admin/profile` | Perfil del administrador |

### Portal Operador (`/mobile`, APK Android)

| Ruta | Descripción |
|------|-------------|
| `/mobile/services` | Lista de servicios asignados, filtrable por fecha |
| `/mobile/services/:id` | Detalle del servicio: GPS, navegación, inicio y finalización |
| `/mobile/services/:id/finished` | Pantalla de confirmación al finalizar el servicio |
| `/mobile/profile-mobile` | Perfil del operador |

---

## Funcionalidad GPS — feature central del operador

La pantalla `/mobile/services/:id` es el núcleo de la app Android:

- **Geolocalización:** obtiene la posición actual del operador vía `@capacitor/geolocation` (solicita permisos en primer uso)
- **Distancia:** calcula la distancia al destino del servicio usando la fórmula de Haversine
- **Navegación externa:** abre Google Maps o Waze con las coordenadas del servicio
- **Inicio de servicio:** llama a `PATCH /api/Operaciones/iniciar` y actualiza el estado local
- **Finalización:** llama a `PATCH /api/Operaciones/finalizar` y redirige a `/finished`

Las pantallas de detalle y finalización ocultan la bottom nav (`data: { hideBottomNav: true }`).

---

## Autenticación y guards

### Flujo
1. Login POST a `/api/Auth/login` (usuario/pass) o Google OAuth (admin)
2. Respuesta: `{ token, user }` — se guarda en `localStorage`
3. El guard evalúa el rol del usuario en `auth.session` y activa `/admin` o `/mobile`
4. El `authInterceptor` agrega `Authorization: Bearer <token>` a cada request HTTP

### Interceptores HTTP

| Interceptor | Comportamiento |
|-------------|----------------|
| `authInterceptor` | Adjunta el token JWT a todas las peticiones (excepto `/api/login/authenticate`) |
| `loaderInterceptor` | Activa/desactiva el spinner global mientras hay requests en vuelo |
| `errorInterceptor` | `401` → logout y redirige a login; `429`/`504` → alerta SweetAlert2 |

---

## Ejecutar el proyecto

### Servidor de desarrollo (web)

```bash
npm install
npm start       # http://localhost:4200
```

### Build de producción + SSR

```bash
npm run build   # genera dist/frontend-ng20/browser y dist/frontend-ng20/server
npm run serve:ssr:frontend-ng20   # Express SSR en http://localhost:4000
```

### Build APK Android

```bash
# 1. Build del proyecto Angular
npm run build

# 2. Sincronizar assets con el proyecto nativo
npx cap sync android

# 3. Abrir Android Studio para generar el APK
npx cap open android
```

En Android Studio: **Build → Generate Signed App Bundle / APK**.

---

## Testing

```bash
npm test        # Karma + Jasmine (modo watch)
```

El formato de código se controla con Prettier (configuración en `package.json`): `printWidth: 100`, `singleQuote: true`.

---

## Estructura de carpetas

```
src/
├── app/
│   ├── core/
│   │   ├── guards/           # canMatch + canActivate por rol
│   │   ├── interceptors/     # auth, loader, error
│   │   ├── services/         # AuthService, ServicesService, UserService, LoaderService
│   │   └── strategies/       # MobileReuseStrategy (recrear componentes en tabs)
│   │
│   ├── features/
│   │   ├── dashboard/        # KPIs y gráficos (admin)
│   │   ├── services/         # Lista de servicios del operador
│   │   ├── service-detail/   # GPS, inicio y fin de servicio
│   │   ├── service-finished/ # Confirmación de finalización
│   │   ├── profile/          # Perfil admin
│   │   ├── profile-mobile/   # Perfil operador
│   │   └── users/            # CRUD usuarios (admin)
│   │
│   ├── shared/
│   │   └── components/       # bottom-nav, header, sidebar, service-card, loader, modal, table
│   │
│   ├── layouts/
│   │   ├── admin/            # Shell admin: sidebar + header
│   │   ├── mobile-layout/    # Shell móvil: bottom nav con lógica de ocultamiento
│   │   └── authentication/   # Login web (OAuth) y login móvil (usuario/pass)
│   │
│   └── models/               # auth, service, user (api + view), ui
│
├── environments/
│   ├── environment.ts              # Producción / build por defecto
│   └── environment.development.ts  # Desarrollo local
│
└── server.ts                 # Servidor Express para SSR
```
