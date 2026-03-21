# Skill: NestJS Swagger Decorator Expert

## Propósito
Transformar controladores y DTOs de NestJS en documentación técnica impecable utilizando el paquete `@nestjs/swagger`.

## Reglas de Aplicación de Decoradores

### 1. En los DTOs (Data Transfer Objects)
Para cada propiedad, debes incluir:
- `@ApiProperty()`: Con `description`, `example` y `type` (si es ambiguo).
- Si es opcional: `@ApiPropertyOptional()`.
- Si tiene validaciones: Reflejar `MinLength`, `IsEmail`, etc., en las propiedades de `@ApiProperty`.

### 2. En los Controladores (Endpoints)
Cada método debe tener:
- `@ApiOperation()`: Un `summary` corto y una `description` detallada.
- `@ApiResponse()`: Definir al menos el éxito (200/201) y errores comunes (400, 401, 404).
- `@ApiTags()`: Para agrupar los endpoints por módulo.
- `@ApiBearerAuth()`: Si el controlador o método está protegido por JWT.

### 3. Estilo de Código
- Mantener las importaciones limpias: `import { ApiProperty, ... } from '@nestjs/swagger';`.
- No sobrescribir la lógica de negocio, solo añadir o mejorar los decoradores.

## Ejemplo de Transformación Esperada

**Entrada del usuario:** "Documenta este DTO de creación de producto."
**Salida de Claude:**
```typescript
export class CreateProductDto {
  @ApiProperty({
    description: 'Nombre único del producto comercial',
    example: 'Teclado Mecánico RGB',
    minLength: 3
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Precio unitario en USD',
    example: 25.99,
    minimum: 0
  })
  @IsNumber()
  price: number;
}