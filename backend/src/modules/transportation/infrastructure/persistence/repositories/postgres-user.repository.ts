import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { UserRepository } from '../../../domain/repositories/user.repository.interface';
import { User } from '../../../domain/entities/user.entity';
import { UserMapper } from '../mappers/user.mapper';
import { TypeOrmUserEntity } from '../entities/user.entity';

@Injectable()
export class PostgresUserRepository implements UserRepository {
  constructor(private readonly dataSource: DataSource, private readonly txManager?: EntityManager) {}

  private get manager(): EntityManager {
    return this.txManager || this.dataSource.manager;
  }

  async findById(id: string): Promise<User | null> {
    const raw = await this.manager.findOne(TypeOrmUserEntity, { where: { id } });
    return raw ? UserMapper.toDomain(raw) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const raw = await this.manager.findOne(TypeOrmUserEntity, { where: { email } });
    return raw ? UserMapper.toDomain(raw) : null;
  }

  async findAll(): Promise<User[]> {
    const raws = await this.manager.find(TypeOrmUserEntity);
    return raws.map(raw => UserMapper.toDomain(raw));
  }

  async save(user: User): Promise<void> {
    const persistenceData = UserMapper.toPersistence(user);
    await this.manager.save(TypeOrmUserEntity, persistenceData);
  }

  async delete(id: string): Promise<void> {
    await this.manager.delete(TypeOrmUserEntity, id);
  }
}
