import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ZodValidationPipe } from 'nestjs-zod';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para el frontend
  app.enableCors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Habilitamos el pipe global de Zod para validaciones automáticas en los DTOs
  app.useGlobalPipes(new ZodValidationPipe());

  // Establecer el prefijo global para todas las rutas del API
  app.setGlobalPrefix('api');

  // Configuración extendida de Swagger
  const config = new DocumentBuilder()
    .setTitle('🚌 Sistema de Transporte Escolar - API Core')
    .setDescription(`
      Documentación técnica de la API para el control de asistencia y logística de transporte escolar.
    `)
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingresa tu token JWT aquí',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Customizar la UI de Swagger (ahora en /docs)
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      docExpansion: 'list',
      filter: true,
      showRequestDuration: true,
    },
    customSiteTitle: 'Documentación API Transporte',
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`\n🚀 Backend is running on: http://localhost:3000/api`);
  console.log(`📖 Swagger documentation: http://localhost:3000/docs\n`);
}
bootstrap();
