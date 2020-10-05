/** @format */

import { Column } from 'typeorm';
import { UserEntity } from './user.entity';

export class UserEntityMock extends UserEntity {
  @Column({
    type: 'jsonb',
    nullable: true,
  })
  settings!: Record<string, string>;
}
