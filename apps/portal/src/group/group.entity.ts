/** @format */

//#region Imports NPM
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Index, Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
//#endregion
//#region Imports Local
import { LoginService } from '@back/shared/graphql/LoginService';
//#endregion

@ObjectType()
@Entity('group')
@Index(['loginService'])
@Index(['loginService', 'loginDomain'])
@Index(['loginService', 'loginDomain', 'loginGUID'])
@Index(['loginService', 'loginDomain', 'name'])
export class Group {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Field(() => Date, { nullable: true })
  @CreateDateColumn()
  createdAt?: Date | null;

  @Field(() => Date, { nullable: true })
  @UpdateDateColumn()
  updatedAt?: Date | null;

  @Field(() => String, { nullable: false })
  @Column({
    type: 'varchar',
    nullable: false,
  })
  name!: string;

  @Field(() => String, { nullable: true })
  @Column({
    type: 'varchar',
    nullable: true,
  })
  description?: string;

  @Field(() => LoginService)
  @Column({
    type: 'enum',
    enum: LoginService,
    nullable: false,
    default: LoginService.LOCAL,
  })
  loginService!: LoginService;

  @Field(() => String, { nullable: true })
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  loginDomain?: string;

  @Field(() => String, { nullable: true })
  @Column({
    type: 'varchar',
    nullable: true,
  })
  loginDN?: string;

  @Field(() => String, { nullable: true })
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  loginGUID?: string;
}
