# Arquitectura por capas

Este proyecto usa una arquitectura en capas que separa responsabilidades y facilita la reutilizacion entre implementaciones. Cada pieza nueva debe ubicarse en la capa correspondiente y respetar las reglas de dependencia descritas a continuacion.

```
src/app
- core/       # Servicios singleton, guards, interceptores y providers globales
- shared/     # Componentes UI standalone, utilidades y helpers reutilizables
- features/   # Modulos de negocio (dashboard, users, profile, etc.)
```

## Core

- **Responsabilidad:** proveer capacidades transversales para toda la app (autenticacion, manejo de errores, configuracion, interceptores HTTP, servicios singleton).
- **Ubicacion:** `src/app/core`.
- **Como se consume:** se registran a traves de `CORE_PROVIDERS` en `app.config.ts` o se importan mediante inyeccion directa (`inject(AuthService)`).
- **Buenas practicas:**
  - Exportar providers desde `core.providers.ts` para centralizar wiring global.
  - Evitar dependencias hacia `shared` o `features`; Core debe ser independiente del dominio.
  - Mantener las clases puras y testeables (sin tocar el DOM ni acceder al estado global del navegador directamente).

## Shared

- **Responsabilidad:** entregar building blocks reutilizables (componentes UI standalone, directivas, pipes, utilidades puras).
- **Ubicacion:** `src/app/shared`.
- **Como se consume:** los componentes standalone se importan directamente en la seccion `imports` de otros componentes o modulos. Las utilidades se importan por funcion.
- **Buenas practicas:**
  - No depender de elementos de `features`. Shared puede inyectar servicios de Core, pero nunca al reves.
  - Mantener la API de los componentes neutra y configurable para facilitar su reutilizacion en distintos proyectos.
  - Documentar props y eventos relevantes dentro del propio componente.

## Features

- **Responsabilidad:** concentrar el comportamiento de cada dominio funcional (dashboard, perfil, usuarios, etc.).
- **Ubicacion:** `src/app/features`.
- **Como se consume:** cada carpeta de feature define sus rutas en `features-routing.module.ts` y expone componentes standalone o modulos especificos.
- **Buenas practicas:**
  - Mantener una carpeta por feature (`features/<nombre>/`) con subcarpetas internas (`components`, `pages`, `services`, etc.) segun sea necesario.
  - Consumir UI reutilizable desde `shared` y logica transversal desde `core`. Evitar dependencias entre features; cuando dos features necesitan compartir algo, moverlo a `shared`.
  - Para nuevas pantallas, agregar la ruta en `features-routing.module.ts` y, si aplica, crear guards o resolvers dentro de la carpeta del feature.

## Reglas de dependencia

| Capa origen | Puede depender de | No debe depender de        |
|-------------|-------------------|-----------------------------|
| `core`      | (ninguna)         | `shared`, `features`        |
| `shared`    | `core`            | `features`                  |
| `features`  | `core`, `shared`  | Otros features directamente |

## Flujo sugerido para nuevos features

1. Crear carpeta dentro de `src/app/features/<feature-name>`.
2. Definir componentes standalone dentro de la carpeta (por ejemplo `components/`, `pages/`).
3. Registrar la ruta en `src/app/features/features-routing.module.ts`.
4. Si el feature requiere servicios propios, alojarlos dentro de la carpeta del feature evitando colocarlos en `core` a menos que sean transversales.
5. Reutilizar componentes o helpers de `shared`; si lo que necesitas no existe, crealo en `shared` antes de duplicar codigo.

## Providers globales

- Los providers compartidos (interceptores HTTP, configuracion, inicializadores) se centralizan en `src/app/core/core.providers.ts`.
- Cualquier nuevo provider transversal debe agregarse a `CORE_PROVIDERS` y sera registrado automaticamente en `app.config.ts`.

## Documentacion adicional

- Manten este documento actualizado cuando aparezcan nuevas capas o reglas.
- Agrega ejemplos de naming o estructura especificos si el equipo adopta convenciones adicionales (por ejemplo `feature.service.ts`, `feature.store.ts`, `feature.routes.ts`).
