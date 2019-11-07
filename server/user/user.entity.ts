/** @format */

// #region Imports NPM
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
// #endregion
// #region Imports Local
// eslint-disable-next-line import/no-cycle
import { UserResponse } from './models/user.dto';
// eslint-disable-next-line import/no-cycle
import { ProfileEntity } from '../profile/profile.entity';
// eslint-disable-next-line import/no-cycle
import { LoginService, UserSettings } from '../../lib/types';
// #endregion

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({
    type: 'varchar',
    unique: true,
  })
  username: string;

  @Column('text')
  password: string;

  @Column({
    type: 'boolean',
    nullable: false,
    unique: false,
    default: false,
  })
  disabled: boolean;

  @Column({
    type: 'boolean',
    default: false,
  })
  isAdmin: boolean;

  @Column({
    type: 'jsonb',
  })
  settings: UserSettings;

  @OneToOne((_type: any) => ProfileEntity)
  @JoinColumn()
  profile: ProfileEntity;

  @BeforeUpdate()
  @BeforeInsert()
  async hashPassword(): Promise<void> {
    this.password =
      this.password === `$${LoginService.LDAP}` ? `$${LoginService.LDAP}` : await bcrypt.hash(this.password, 10);
  }

  comparePassword = async (attempt: string | undefined): Promise<boolean> =>
    bcrypt.compare(attempt || '', this.password);

  toResponseObject = (session: string): UserResponse => ({ session, ...this });
}
