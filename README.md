# Frontend Base Angular 20

Aplicacion web de panel administrativo construida con Angular 20 y componentes standalone. Incluye autenticacion por roles, gestion de usuarios, tablero de indicadores y un sistema de UI reutilizable basado en Bootstrap 5.

## Caracteristicas principales

- Autenticacion contra API externa (`/api/login/authenticate`) con persistencia de sesion en `localStorage`, guards de ruta (`canMatch`, `canActivate`) y cierre de sesion centralizado.
- Layout de administrador con barra lateral dinamica, header con menu de perfil y manejo responsive desde `AdminComponent`.
- Pagina de dashboard con widgets de resumen, graficos de tendencia y acciones rapidas accionadas desde `AuthService`.
- Modulo de usuarios con tabla reutilizable, filtros, formularios reactivos, roles cargados desde `/api/Usuario/roles` y soporte para altas, ediciones y bajas en lote.
- Conjunto de componentes compartidos (`shared/`) para tabla, modal, loader, sidebar y utilidades que facilitan la extension del proyecto.
- Preparado para renderizado del lado del servidor mediante `@angular/ssr` y servidor Express (`src/server.ts`).

## Stack tecnico

- Angular 20 (standalone components y Angular Router)
- RxJS para flujos asincronos
- Angular Forms (reactive forms)
- Bootstrap 5 y Bootstrap Icons para el diseno
- SweetAlert2 para dialogos enriquecidos
- Express + Angular SSR para despliegues con renderizado en servidor

## Estructura relevante

```
src/
  app/
    core/          # Servicios, guards e interceptores
    layouts/       # Layouts de autenticacion y administrador
    features/      # Modulos de negocio (dashboard, profile, users)
    models/        # Modelos compartidos entre UI y API
    shared/        # Componentes reutilizables (tabla, modal, loader, sidebar, utils)
  environments/    # Configuracion de API por entorno
  server.ts        # Servidor Express para SSR
```

Consulta `docs/architecture.md` para revisar las reglas completas de cada capa y las dependencias permitidas.

## Requisitos previos

- Node.js 20 LTS (recomendado)
- npm 10+
- Angular CLI 20 (`npm install -g @angular/cli`), opcional si se desea usar la CLI globalmente

## Configuracion de entorno

Actualiza las URLs de API y el `googleClientId` en los archivos de entorno segun el backend disponible:

- Desarrollo: `src/environments/environment.development.ts`
- Produccion (build por defecto): `src/environments/environment.ts`

```
export const environment = {
  production: false,
  apiUrl: 'https://localhost:44330',
  googleClientId: 'TU_CLIENT_ID_DE_GOOGLE'
};
```

## Puesta en marcha

1. Instalar dependencias: `npm install`
2. Levantar el servidor de desarrollo: `npm start`
3. Abrir `http://localhost:4200/`

El servidor recarga automaticamente ante cambios en el codigo fuente.

## Scripts disponibles

- `npm start`: ejecuta `ng serve` con configuracion de desarrollo.
- `npm run build`: genera el build optimizado en `dist/frontend-ng20/browser`.
- `npm run watch`: ejecuta build incremental con `--watch`.
- `npm test`: ejecuta pruebas unitarias con Karma y Jasmine.
- `npm run serve:ssr:frontend-ng20`: inicia el servidor Node (`dist/frontend-ng20/server/server.mjs`) para probar SSR despues de un `ng build` o `ng build --configuration production --ssr`.

## Pruebas y calidad

- Las pruebas unitarias usan Karma + Jasmine (`npm test`).
- El formato de codigo se controla con Prettier (configuracion incluida en `package.json`).
- Sigue las convenciones de Angular CLI para generar nuevos componentes (`ng generate ...`). Se recomienda usar siempre componentes standalone para mantener consistencia con el proyecto actual.

## Consideraciones de despliegue

- Genera el build de produccion con `ng build --configuration production --ssr` para crear artefactos de cliente y servidor.
- Sirve la carpeta `dist/frontend-ng20/browser` como recursos estaticos y ejecuta `node dist/frontend-ng20/server/server.mjs` para habilitar SSR.
- Configura la variable de entorno `PORT` antes de iniciar el servidor si necesitas un puerto distinto (por defecto 4000).
