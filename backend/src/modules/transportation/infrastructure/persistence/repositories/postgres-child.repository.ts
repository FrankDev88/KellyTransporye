import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { ChildRepository } from '../../../domain/repositories/child.repository.interface';
import { Child, ChildStatus } from '../../../domain/entities/child.entity';
import { ChildMapper } from '../mappers/child.mapper';
import { TypeOrmChildEntity } from '../entities/child.entity';

@Injectable()
export class PostgresChildRepository implements ChildRepository {
  constructor(private readonly dataSource: DataSource, private readonly txManager?: EntityManager) {}

  private get manager(): EntityManager {
    return this.txManager || this.dataSource.manager;
  }

  async findById(id: string): Promise<Child | null> {
    const raw = await this.manager.findOne(TypeOrmChildEntity, { where: { id } });
    return raw ? ChildMapper.toDomain(raw) : null;
  }

  async findByQr(qrIdentifier: string): Promise<Child | null> {
    const raw = await this.manager.findOne(TypeOrmChildEntity, { where: { qrIdentifier } });
    return raw ? ChildMapper.toDomain(raw) : null;
  }

  async findByStatus(status: ChildStatus): Promise<Child[]> {
    const rawList = await this.manager.find(TypeOrmChildEntity, { where: { status } });
    return rawList.map(raw => ChildMapper.toDomain(raw));
  }

  async findByParent(parentId: string): Promise<Child[]> {
    const rawList = await this.manager.find(TypeOrmChildEntity, { where: { parentId } });
    return rawList.map(raw => ChildMapper.toDomain(raw));
  }

  async save(child: Child): Promise<void> {
    const persistenceData = ChildMapper.toPersistence(child);
    await this.manager.save(TypeOrmChildEntity, persistenceData);
  }
}
