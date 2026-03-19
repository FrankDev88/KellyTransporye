import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ZodValidationPipe } from 'nestjs-zod';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitamos el pipe global de Zod para validaciones automáticas en los DTOs
  app.useGlobalPipes(new ZodValidationPipe());

  // Configuración extendida de Swagger
  const config = new DocumentBuilder()
    .setTitle('🚌 Sistema de Transporte Escolar - API Core')
    .setDescription(`
      Documentación técnica de la API para el control de asistencia y logística de transporte escolar.
      
      ### Flujos Principales:
      1. **Gestión de Rutas**: Creación de plantillas maestras y arranque de viajes diarios.
      2. **Asistencia QR**: Registro de abordaje y entrega mediante escaneo de gafetes.
      3. **Protocolos de Seguridad**: Manejo de geocercas (geofencing) y contingencias (manual check-in).
      4. **Administración**: Confirmación de inasistencias y recálculo dinámico de trayectos.
      
      *Versión: 1.0 (Clean Architecture & CQRS)*
    `)
    .setVersion('1.0')
    .addTag('1. Planificación y Ejecución de Rutas', 'Endpoints para administrar plantillas maestras y el ciclo de vida de los viajes (Trips).')
    .addTag('2. Asistencia Estándar (QR)', 'Operaciones diarias del chofer mediante el escaneo de códigos QR.')
    .addTag('3. Contingencia (Gafete Perdido)', 'Endpoints de respaldo para situaciones donde el niño no porta su identificación física.')
    .addTag('4. Administración', 'Funciones de oficina para control de faltas y supervisión.')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  // Customizar la UI de Swagger
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      docExpansion: 'list',
      filter: true,
      showRequestDuration: true,
    },
    customSiteTitle: 'Documentación API Transporte',
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`\n🚀 Backend is running on: http://localhost:3000`);
  console.log(`📖 Swagger documentation: http://localhost:3000/api\n`);
}
bootstrap();
