import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { TypeOrmUserEntity } from './modules/transportation/infrastructure/persistence/entities/user.entity';
import { TypeOrmChildEntity } from './modules/transportation/infrastructure/persistence/entities/child.entity';
import { TypeOrmRouteTemplateEntity } from './modules/transportation/infrastructure/persistence/entities/route-template.entity';
import { TypeOrmRouteTemplateStopEntity } from './modules/transportation/infrastructure/persistence/entities/route-template-stop.entity';
import { UserRole } from './modules/transportation/domain/entities/user.entity';
import { RouteType } from './modules/transportation/domain/entities/route-template.entity';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [
    TypeOrmUserEntity,
    TypeOrmChildEntity,
    TypeOrmRouteTemplateEntity,
    TypeOrmRouteTemplateStopEntity,
  ],
  synchronize: false,
});

async function seed() {
  try {
    await dataSource.initialize();
    console.log('🌱 Iniciando seeding de la base de datos...');

    const userRepository = dataSource.getRepository(TypeOrmUserEntity);
    const childRepository = dataSource.getRepository(TypeOrmChildEntity);
    const routeRepo = dataSource.getRepository(TypeOrmRouteTemplateEntity);
    const stopRepo = dataSource.getRepository(TypeOrmRouteTemplateStopEntity);

    const passwordHash = bcrypt.hashSync('password123', 10);

    // 1. Crear o Recuperar Usuarios
    console.log('👤 Gestionando usuarios...');
    
    let admin = await userRepository.findOneBy({ email: 'admin@transporte.com' });
    if (!admin) {
      admin = userRepository.create({
        email: 'admin@transporte.com',
        passwordHash,
        fullName: 'Admin Sistema',
        role: UserRole.ADMIN,
      });
      await userRepository.save(admin);
      console.log('✅ Admin creado.');
    }

    let driver = await userRepository.findOneBy({ email: 'driver@transporte.com' });
    if (!driver) {
      driver = userRepository.create({
        email: 'driver@transporte.com',
        passwordHash,
        fullName: 'Juan Chofer',
        role: UserRole.DRIVER,
        phoneNumber: '+525500001111'
      });
      await userRepository.save(driver);
      console.log('✅ Chofer creado.');
    }

    let parent = await userRepository.findOneBy({ email: 'padre@correo.com' });
    if (!parent) {
      parent = userRepository.create({
        email: 'padre@correo.com',
        passwordHash,
        fullName: 'Ricardo Padre',
        role: UserRole.PARENT,
      });
      await userRepository.save(parent);
      console.log('✅ Padre creado.');
    }

    // 2. Crear Niños
    const childrenCount = await childRepository.count();
    if (childrenCount === 0) {
      console.log('🧒 Creando niños...');
      const child1 = childRepository.create({
        firstName: 'Mateo',
        lastName: 'García',
        qrIdentifier: randomUUID(),
        parentId: parent.id,
        homeAddress: 'Calle Roble 123',
        homeLatLong: '(19.4326, -99.1332)',
        isActive: true,
      });

      const child2 = childRepository.create({
        firstName: 'Sofía',
        lastName: 'García',
        qrIdentifier: randomUUID(),
        parentId: parent.id,
        homeAddress: 'Calle Roble 123',
        homeLatLong: '(19.4326, -99.1332)',
        isActive: true,
      });

      await childRepository.save([child1, child2]);

      // 3. Crear Plantilla de Ruta
      console.log('🚌 Creando plantilla de ruta...');
      const template = routeRepo.create({
        name: 'Ruta Mañana - Sector Norte',
        type: RouteType.HOME_TO_SCHOOL,
        estimatedDuration: '45 minutes',
      });
      await routeRepo.save(template);

      // 4. Crear Paradas (Stops)
      console.log('📍 Asignando paradas...');
      await stopRepo.save([
        stopRepo.create({ templateId: template.id, childId: child1.id, stopOrder: 1 }),
        stopRepo.create({ templateId: template.id, childId: child2.id, stopOrder: 2 })
      ]);
      console.log('✅ Datos de logística creados.');
    } else {
      console.log('ℹ️ Saltando creación de niños y rutas (ya existen datos).');
    }

    console.log('✨ Proceso de seeding finalizado.');
    console.log('\n--- CREDENCIALES DISPONIBLES ---');
    console.log('Admin:  admin@transporte.com / password123');
    console.log('Chofer: driver@transporte.com / password123');
    console.log('Padre:  padre@correo.com / password123');
    console.log('------------------------------\n');

  } catch (error) {
    console.error('❌ Error durante el seeding:', error);
  } finally {
    await dataSource.destroy();
  }
}

seed();
