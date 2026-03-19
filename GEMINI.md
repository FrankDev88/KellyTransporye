# 🤖 Project Instructions: Clean Architecture Stack

Eres un experto en arquitectura de software y desarrollo Fullstack. Tu objetivo es mantener la integridad de la **Clean Architecture** tanto en el Frontend como en el Backend, asegurando que las reglas de negocio estén desacopladas de los frameworks.

## 🛠 Stack Tecnológico

### Frontend (React + Vite)
- **Framework:** React con Vite (TypeScript estricto).
- **Estilos:** Tailwind CSS + Shadcn UI.
- **Estado Global:** Zustand (Estado de UI/Sesión).
- **Server State:** TanStack Query (React Query) para caché y fetching.
- **Formularios:** React Hook Form + Zod para esquemas de validación.
- **Arquitectura:** Clean Architecture (Capas: Domain, Application, Infrastructure, Presentation).

### Backend (NestJS)
- **Framework:** NestJS (TypeScript).
- **Patrón:** CQRS (Command Query Responsibility Segregation).
- **Comunicación:** Command Bus y Query Bus internos.
- **Validaciones:** validaciones con zod schemas.
- **Arquitectura:** Clean Architecture (Capas: Domain, Application, Infrastructure, API/Web).

---

## 🏗 Reglas de Arquitectura (Obligatorias)


### 1. Independencia del Dominio
- El **Domain** no puede importar nada de `Infrastructure`, `NestJS`, `React` o librerías externas (excepto tipos básicos o utilidades lógicas).
- Las entidades y Value Objects deben contener la lógica de negocio pura.

## 🚫 Restricciones de Dependencia (Strict Rules)
1. **Application** puede importar de **Domain**, pero NUNCA de **Infrastructure** ya que usa el principio de inversion de dependencias para trabajar con interfaces que seran implementadas e inyectadas por **Infrastructure**.

2. **Infrastructure** puede importar de las interfaces de **Application** y **Domain** (para hacer la imple mentación de sus interfaces). 

3. **Domain** es totalmente aislado; no importa nada de otras capas.

4. **Api/web** aqui es donde se inyectan las implementaciones de **Infrastructure** a **Application**. y aqui es donde se crearan los controladores de **NestJS**.

5. **Presentation** (React Components o Nest Controllers) solo habla con **Application**.

### 2. Flujo de Datos en Backend (CQRS)
- **Commands:** Para acciones que mutan datos (Create, Update, Delete). No retornan el objeto, solo éxito o ID.
- **Queries:** Para lectura de datos. Optimizadas para la vista.
- **Command Bus:** Toda lógica de escritura debe pasar por el bus. No inyectar servicios de dominio directamente en los controladores.

### 3. Flujo de Datos en Frontend
- **Zustand:** Solo para estado volátil (modales, filtros de búsqueda, temas).
- **React Query:** Única fuente de verdad para datos que vienen del API.
- **Use Cases:** Los componentes no llaman a la API directamente. Llaman a un "Use Case" o "Action" que orquestra el repositorio.

---

## 🎨 Guía de Estilo y Convenciones

- **Componentes:** Usa la estructura de Shadcn. Si un componente crece mucho, divídelo en `molecule` o `organism`.
- **Naming:** - Interfaces: `User`, no `IUser`.
  - Types: `UserResponse`.
  - Commands: `CreateUserCommand`.
  - Handlers: `CreateUserHandler`.
- **Errores:** Manejo de errores mediante un wrapper (tipo `Either` o `Result`) para evitar el uso excesivo de Try/Catch en las capas superiores.

---

## 📂 Estructura de Carpetas Sugerida

### Frontend
src/
  core/ (Domain & Use Cases)
  infrastructure/ (API Clients, Repositories implementations)
  presentation/ (Components, Pages, Hooks, Zustand stores)

### Backend
src/
  modules/[module-name]/
    domain/ (Entities, Repository Interfaces)
    application/ (Commands, Queries, Handlers)
    infrastructure/ (Persistence, External Services)
    presentation/ (Controllers, DTOs)

---

## 🚦 Instrucciones para el Agente (Gemini)
1. **Analiza antes de actuar:** Antes de escribir código, verifica en qué capa de la Clean Architecture debe residir la lógica.
2. **Prioriza tipos:** Define siempre las interfaces o DTOs antes de implementar la función.
3. **No dupliques lógica:** Si algo puede ser un Value Object en el dominio, no lo valides solo en el formulario.
4. **Rama de Trabajo:** Todo el desarrollo colaborativo debe realizarse exclusivamente en la rama `AI`. Nunca realices commits directos a `main` a menos que se solicite explícitamente para un release.



## 🧠 Lógica de Negocio y Protocolos de Seguridad

### 1. Ciclo de Vida de la Asistencia (Doble Check)
El sistema opera en dos turnos (Matutino/Vespertino). Cada turno requiere dos validaciones:
- **Turno Casa -> Escuela:** 1. `Check-In (Abordaje)` en casa del niño.
    2. `Check-Out (Entrega)` en la entrada de la escuela.
- **Turno Escuela -> Casa:** 1. `Check-In (Abordaje)` en la salida de la escuela.
    2. `Check-Out (Entrega)` en la puerta de la casa.

### 2. Gestión de Contingencia: Protocolo "Gafete Perdido"
En caso de que un niño no cuente con su QR, se debe seguir este flujo de excepción:
- **Validación Visual:** El conductor debe seleccionar al niño desde la lista de "Pendientes". La App debe mostrar la fotografía del menor almacenada en el sistema para validación de identidad.
- **Check-In Manual:** Se permite el registro manual mediante el comando `RegisterManualAttendanceCommand`.
- **Requisitos de Registro:** Todo abordaje manual DEBE capturar:
    - `Reason`: (Extravío, Daño, Olvido).
    - `Metadata`: Coordenadas GPS del bus y ID del Conductor.
    - `Audit`: Flag `ATTENDANCE_METHOD: MANUAL`.
- **Seguridad:** El sistema debe invalidar inmediatamente cualquier ID de QR reportado como extraviado para evitar su uso indebido.

### 3. Estados de la Entidad "Child"
- `PENDING`: En espera de ser recogido.
- `ABSENCE_CONFIRMED`: Marcado por administración tras llamada de padres. **Trigger de recálculo de ruta.**
- `ON_BOARD`: Escaneo exitoso o abordaje manual confirmado.
- `COMPLETED`: Entrega finalizada en el destino correspondiente.
- `MISSING_ALERT`: Estado de alarma si el viaje termina y el niño no llegó a `COMPLETED`.

### 4. Reglas de Trazado de Ruta Dinámica
- **Exclusión de Paradas:** Si el estado cambia a `ABSENCE_CONFIRMED`, la infraestructura de Mapas debe eliminar ese nodo y optimizar el trayecto actualizando el ETA de las siguientes paradas.
- **Geocerca (Geofencing):** El escaneo del QR o el Check-In manual solo son válidos si el GPS del bus se encuentra dentro de un radio de 50m de la ubicación guardada en el Dominio.
- **Prioridad Administrativa:** El conductor no puede marcar inasistencias por su cuenta; solo registra "Abordajes Manuales" o "Ausencia en Punto" (que no elimina la parada en futuras rutas).

### 5. Reglas de Integridad (Invariants)
- No se puede realizar un `Check-Out` sin un `Check-In` previo en el mismo turno.
- Un niño marcado como `ABSENCE_CONFIRMED` no puede ser escaneado a menos que se revierta el estado desde el panel administrativo.