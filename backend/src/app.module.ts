import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransportationModule } from './modules/transportation/transportation.module';
import { TypeOrmUserEntity } from './modules/transportation/infrastructure/persistence/entities/user.entity';
import { TypeOrmChildEntity } from './modules/transportation/infrastructure/persistence/entities/child.entity';
import { TypeOrmRouteTemplateEntity } from './modules/transportation/infrastructure/persistence/entities/route-template.entity';
import { TypeOrmRouteTemplateStopEntity } from './modules/transportation/infrastructure/persistence/entities/route-template-stop.entity';
import { TypeOrmTripEntity } from './modules/transportation/infrastructure/persistence/entities/trip.entity';
import { TypeOrmTripExceptionEntity } from './modules/transportation/infrastructure/persistence/entities/trip-exception.entity';
import { TypeOrmAttendanceLogEntity } from './modules/transportation/infrastructure/persistence/entities/attendance-log.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES_HOST') || 'localhost',
        port: configService.get<number>('POSTGRES_PORT') || 5432,
        username: configService.get<string>('POSTGRES_USER'),
        password: configService.get<string>('POSTGRES_PASSWORD'),
        database: configService.get<string>('POSTGRES_DB'),
        entities: [
          TypeOrmUserEntity,
          TypeOrmChildEntity,
          TypeOrmRouteTemplateEntity,
          TypeOrmRouteTemplateStopEntity,
          TypeOrmTripEntity,
          TypeOrmTripExceptionEntity,
          TypeOrmAttendanceLogEntity,
        ],
        synchronize: false,
      }),
    }),
    TransportationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
