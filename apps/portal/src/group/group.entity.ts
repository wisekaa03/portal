/** @format */

//#region Imports NPM
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
//#endregion
//#region Imports Local
import { LoginService } from '@lib/types/login-service';
//#endregion

@Entity('group')
export class GroupEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  name: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  dn: string;

  @Column({
    type: 'varchar',
    length: 10,
    nullable: false,
    default: LoginService.LOCAL,
  })
  loginService: LoginService;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    unique: true,
  })
  loginIdentificator: string;

  toResponseObject = (): GroupEntity => ({ ...this });
}
