-- =============================================================================
-- 1. EXTENSIONES Y ENUMS (INTEGRIDAD DE DOMINIO)
-- =============================================================================
-- Necesario para generar UUIDs automáticamente
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Define los roles permitidos para la lógica de autorización en NestJS
CREATE TYPE user_role AS ENUM ('ADMIN', 'DRIVER', 'PARENT');

-- Define los estados de un niño durante el ciclo de vida de un viaje
CREATE TYPE attendance_status AS ENUM (
    'PENDING',            -- Estado inicial por defecto
    'ON_BOARD',           -- El niño subió al bus (Check-in)
    'COMPLETED',          -- El niño llegó a su destino final (Check-out)
    'ABSENCE_CONFIRMED'   -- El padre avisó que no iría (Activa el recálculo)
);

-- Define cómo se registró la asistencia (para auditoría de seguridad)
CREATE TYPE attendance_method AS ENUM (
    'QR_SCAN',            -- Operación normal con gafete
    'MANUAL_BY_DRIVER',   -- Protocolo "Gafete Perdido" con validación visual
    'ADMIN_OVERRIDE'      -- Cambio forzado desde oficina
);

-- Determina la lógica de ordenamiento de paradas (Hacia escuela vs Hacia casa)
CREATE TYPE route_type AS ENUM ('HOME_TO_SCHOOL', 'SCHOOL_TO_HOME');

-- =============================================================================
-- 2. ENTIDADES MAESTRAS (DATOS ESTÁTICOS)
-- =============================================================================

-- Tabla de Usuarios: Maneja autenticación y perfiles
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL, -- Determina permisos en el Command Bus
    phone_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Niños: El núcleo del negocio
CREATE TABLE children (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    photo_url TEXT, -- USADO EN: Protocolo Gafete Perdido (Validación visual)
    qr_identifier UUID UNIQUE NOT NULL, -- Token único impreso en el gafete físico
    parent_id UUID REFERENCES users(id),
    home_address TEXT NOT NULL,
    home_lat_long POINT NOT NULL, -- USADO EN: Geofencing (Validar que el bus está en la casa)
    is_active BOOLEAN DEFAULT TRUE -- Soft delete para no perder historial
);

-- =============================================================================
-- 3. PLAN MAESTRO (TEMPLATES DE RUTA)
-- =============================================================================
-- Estas tablas definen el "Deber Ser". No cambian día con día.

-- Define una ruta genérica (ej: "Ruta 05 - Sector Norte")
CREATE TABLE route_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type route_type NOT NULL,
    default_driver UUID REFERENCES users(id), -- Conductor asignado por defecto
    estimated_duration INTERVAL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Define el orden lógico de las paradas para cada niño en una ruta específica
CREATE TABLE route_template_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES route_templates(id) ON DELETE CASCADE,
    child_id UUID REFERENCES children(id) ON DELETE CASCADE,
    stop_order INT NOT NULL, -- El orden (1, 2, 3...) para el algoritmo de Google Maps
    UNIQUE(template_id, child_id), -- Un niño no puede estar dos veces en la misma ruta
    UNIQUE(template_id, stop_order) -- Dos niños no pueden tener el mismo número de parada
);

-- =============================================================================
-- 4. EJECUCIÓN Y EXCEPCIONES (EL MODELO LEAN)
-- =============================================================================
-- Aquí es donde evitamos la redundancia. No copiamos la lista de niños.

-- Representa un viaje real que está sucediendo o va a suceder
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES route_templates(id),
    driver_id UUID REFERENCES users(id), -- Quién maneja hoy
    scheduled_start TIMESTAMPTZ NOT NULL, -- Fecha y hora planeada
    actual_start TIMESTAMPTZ, -- Cuándo el conductor dio "Iniciar Ruta"
    actual_end TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT FALSE -- Solo una ruta puede estar activa por chofer
);

-- TABLA DE EXCEPCIONES: Solo guarda a los niños que NO van
-- LOGICA: Si un niño está aquí, el Query de "Ver Mapa" lo ignora para el recálculo
CREATE TABLE trip_exceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    child_id UUID REFERENCES children(id) ON DELETE CASCADE,
    exception_type attendance_status DEFAULT 'ABSENCE_CONFIRMED',
    reason TEXT, -- Ej: "Padre confirmó falta por teléfono"
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(trip_id, child_id) -- Un niño solo puede tener una excepción por viaje
);

-- =============================================================================
-- 5. HECHOS Y AUDITORÍA (ATTENDANCE LOGS)
-- =============================================================================
-- Registra lo que SÍ pasó. Es la verdad legal del sistema.

CREATE TABLE attendance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id),
    child_id UUID REFERENCES children(id),
    status attendance_status NOT NULL, -- ON_BOARD (subió) o COMPLETED (bajó)
    method attendance_method NOT NULL, -- QR_SCAN o MANUAL_BY_DRIVER
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    gps_location POINT NOT NULL, -- Ubicación exacta donde ocurrió el evento
    authorized_by UUID REFERENCES users(id), -- ID del chofer/admin que autorizó si fue manual
    notes TEXT -- Ej: "Se registró manual porque el niño mojó el gafete"
);

-- Índices para velocidad de búsqueda en tiempo real (App del Chofer)
CREATE INDEX idx_trip_active ON trips(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_exception_trip ON trip_exceptions(trip_id);