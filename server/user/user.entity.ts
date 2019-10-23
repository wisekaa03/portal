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
import { UserResponse } from './models/user.dto';
import { ProfileEntity } from '../profile/profile.entity';
import { LoginService } from '../../lib/types';
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
    length: 100,
    unique: true,
  })
  username: string;

  @Column('text')
  password: string;

  @Column({
    type: 'boolean',
    nullable: false,
    unique: false,
  })
  disabled: boolean;

  @Column({
    type: 'boolean',
    default: true,
  })
  isAdmin: boolean;

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

  toResponseObject = (token: string): UserResponse => ({ token, ...this });
}
