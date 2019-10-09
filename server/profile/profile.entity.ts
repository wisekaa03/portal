/** @format */

// #region Imports NPM
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
// #endregion
// #region Imports Local
import { LoginService } from '../user/models/user.dto';
import { ProfileResponseDTO, Gender } from './models/profile.dto';
// #endregion

@Entity('profile')
export class ProfileEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  loginService: LoginService;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  loginIdentificator: string;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
  })
  username: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  firstName: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  lastName: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  middleName: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  email: string;

  @Column({
    type: 'date',
    nullable: true,
  })
  birthday: Date;

  @Column({
    type: 'int',
  })
  gender: Gender;

  @Column({
    type: 'json',
    nullable: true,
  })
  addressPersonal: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  company: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  title: string;

  @Column({
    type: 'bytea',
    nullable: true,
    update: true,
    insert: true,
    select: true,
  })
  thumbnailPhoto: Buffer;

  toResponseObject = (): ProfileResponseDTO => ({ ...this });
}
