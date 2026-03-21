# Skill: Experto en Pruebas Unitarias (Clean Architecture)

## Propósito
Guiar la creación de pruebas unitarias (PU) y de integración en proyectos NestJS siguiendo los principios de Clean Architecture, asegurando una cobertura lógica y técnica eficiente.

## Estrategia por Capas

### 1. Capa de Dominio (Entities & Value Objects)
- **Qué probar:** Lógica de negocio pura, validaciones de estado, cálculos internos.
- **Cómo:** Pruebas unitarias puras (sin NestJS/Mocks complejos). Deben ser las más rápidas.
- **Regla:** Si una entidad cambia de estado, la prueba debe verificar el resultado final.

### 2. Capa de Aplicación (Use Cases / Services)
- **Qué probar:** El flujo de la operación. ¿Se llama al repositorio? ¿Se lanza la excepción correcta si falla?
- **Cómo:** Mocks exhaustivos de los puertos (interfaces de repositorio/servicios externos).
- **Herramienta:** `jest.mock()` o `createMock` de `@golevelup/ts-jest`.

### 3. Capa de Infraestructura (Adapters / Repositories)
- **Qué probar:** Mapeo de datos, consultas a BD (si es integración) o lógica de adaptadores externos.
- **Cómo:** Aquí se permiten pruebas de integración con bases de datos en memoria (SQLite/MongoMemoryServer).

### 4. Capa de Presentación (Controllers)
- **Qué probar:** Status codes, validación de DTOs, transformación de respuesta.
- **Cómo:** `supertest` para pruebas E2E ligeras o pruebas unitarias mockeando el caso de uso.

## Instrucciones para Claude
Cuando te pida "crear un test" o "probar este código":
1. Identifica en qué capa está el archivo.
2. Genera el archivo `.spec.ts` siguiendo el patrón **AAA** (Arrange, Act, Assert).
3. Utiliza nombres de tests descriptivos: `should throw UnauthorizedException when token is expired`.
4. Prioriza siempre la inyección de dependencias mediante el `TestingModule` de NestJS.

## Ejemplo de Mocking de Repositorio
"Genera el test para el servicio de Usuarios que depende de un Repositorio":
```typescript
const mockRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
};

const module = await Test.createTestingModule({
  providers: [
    UsersService,
    { provide: UsersRepository, useValue: mockRepository },
  ],
}).compile();