/** @format */

//#region Imports NPM
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
import { LoginService } from '@lib/types/login-service';
import { User, UserSettings } from '@lib/types/user.dto';
import { ProfileEntity } from '@back/profile/profile.entity';
import { GroupEntity } from '@back/group/group.entity';
//#endregion

@Entity('user')
@Index(['loginService', 'loginDomain', 'loginIdentificator', 'username'], { unique: true })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @Column({
    type: 'varchar',
    length: 10,
    nullable: false,
    default: LoginService.LOCAL,
  })
  loginService!: LoginService;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  loginDomain!: string | null;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    unique: true,
  })
  loginIdentificator!: string | null;

  @Column({
    type: 'varchar',
  })
  username!: string;

  @Column('text')
  password!: string;

  @RelationId((user: UserEntity) => user.groups)
  groupIds!: string[] | null;

  @ManyToMany(() => GroupEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinTable({
    name: 'user_groups',
  })
  groups!: GroupEntity[] | null;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
  })
  disabled!: boolean;

  @Column({
    type: 'boolean',
    default: false,
  })
  isAdmin!: boolean;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  settings!: UserSettings | null;

  @RelationId((user: UserEntity) => user.profile)
  profileId!: string;

  @OneToOne(() => ProfileEntity, { onDelete: 'CASCADE' })
  @JoinColumn()
  profile!: ProfileEntity;

  toResponseObject = (): User => ({
    ...this,
  });
}
