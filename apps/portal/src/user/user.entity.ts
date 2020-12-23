/** @format */

//#region Imports NPM
import { ObjectType, Field, ID, HideField } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToOne,
  ManyToMany,
  JoinTable,
  RelationId,
  AfterLoad,
  Index,
} from 'typeorm';
//#endregion
//#region Imports Local
import { LoginService } from '@back/shared/graphql';
import { Profile } from '@back/profile/profile.entity';
import { Group } from '@back/group/group.entity';
import { UserSettings } from './graphql';
//#endregion

@ObjectType()
@Entity('user')
@Index(['loginService', 'loginDomain'])
@Index(['loginService', 'loginDomain', 'loginGUID'])
@Index(['loginService', 'loginDomain', 'username'], { unique: true })
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Field(() => Date, { nullable: true })
  @CreateDateColumn()
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  @UpdateDateColumn()
  updatedAt?: Date;

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
    length: 50,
    nullable: true,
  })
  loginGUID?: string;

  @Field(() => String)
  @Column({
    type: 'varchar',
    nullable: false,
  })
  username!: string;

  @HideField()
  @Column('text')
  password!: string;

  @HideField()
  @RelationId((user: User) => user.groups)
  groupIds?: string[];

  @Field(() => [Group], { nullable: true })
  @ManyToMany(() => Group, { onDelete: 'CASCADE', nullable: true })
  @JoinTable({
    name: 'user_groups',
  })
  groups?: Group[];

  @Field(() => Boolean)
  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
  })
  disabled!: boolean;

  @Field(() => Boolean)
  @Column({
    type: 'boolean',
    default: false,
  })
  isAdmin!: boolean;

  @Field(() => UserSettings)
  @Column({
    type: 'jsonb',
    nullable: true,
  })
  settings!: UserSettings;

  @HideField()
  @RelationId((user: User) => user.profile)
  profileId!: string;

  @Field(() => Profile)
  @OneToOne(() => Profile, { onDelete: 'CASCADE' })
  @JoinColumn()
  profile!: Profile;
}
