/** @format */

//#region Imports NPM
import { Index, Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
//#endregion
//#region Imports Local
import { LoginService } from '@lib/types/login-service';
//#endregion

@Entity('group')
@Index(['loginService', 'loginDomain'])
@Index(['loginService', 'loginDomain', 'loginIdentificator'])
@Index(['loginService', 'loginDomain', 'name'], { unique: true })
export class GroupEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn()
  createdAt?: Date | null;

  @UpdateDateColumn()
  updatedAt?: Date | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  name!: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  dn!: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  description!: string | null;

  @Column({
    type: 'varchar',
    length: 10,
    nullable: false,
    default: LoginService.LOCAL,
  })
  loginService!: LoginService;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  loginDomain!: string | null;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  loginIdentificator!: string | null;

  toResponseObject = (): GroupEntity => ({ ...this });
}
