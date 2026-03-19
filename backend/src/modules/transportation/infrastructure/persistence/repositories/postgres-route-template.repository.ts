import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { RouteTemplateRepository } from '../../../domain/repositories/route-template.repository.interface';
import { RouteTemplate } from '../../../domain/entities/route-template.entity';
import { RouteTemplateMapper } from '../mappers/route-template.mapper';
import { TypeOrmRouteTemplateEntity } from '../entities/route-template.entity';

@Injectable()
export class PostgresRouteTemplateRepository implements RouteTemplateRepository {
  constructor(private readonly dataSource: DataSource, private readonly txManager?: EntityManager) {}

  private get manager(): EntityManager {
    return this.txManager || this.dataSource.manager;
  }

  async findById(id: string): Promise<RouteTemplate | null> {
    const raw = await this.manager.findOne(TypeOrmRouteTemplateEntity, {
      where: { id },
      relations: ['stops'],
    });
    return raw ? RouteTemplateMapper.toDomain(raw) : null;
  }

  async findAll(): Promise<RouteTemplate[]> {
    const rawList = await this.manager.find(TypeOrmRouteTemplateEntity, {
      relations: ['stops'],
    });
    return rawList.map(raw => RouteTemplateMapper.toDomain(raw));
  }

  async save(template: RouteTemplate): Promise<void> {
    const persistenceData = RouteTemplateMapper.toPersistence(template);
    await this.manager.save(TypeOrmRouteTemplateEntity, persistenceData);
  }
}
