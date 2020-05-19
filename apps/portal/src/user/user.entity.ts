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
} from 'typeorm';
//#endregion
//#region Imports Local
import { LoginService } from '@lib/types/login-service';
import { UserSettings } from '@lib/types/user.dto';
import { ProfileEntity } from '@back/profile/profile.entity';
import { GroupEntity } from '@back/group/group.entity';
//#endregion

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

  @Column({
    type: 'varchar',
    unique: true,
  })
  username: string;

  @Column('text')
  password: string;

  @RelationId((user: UserEntity) => user.groups)
  groupIds: string[];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  @ManyToMany((type) => GroupEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinTable({
    name: 'user_groups',
  })
  groups: GroupEntity[];

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
    nullable: true,
  })
  settings: UserSettings;

  @RelationId((user: UserEntity) => user.profile)
  profileId: string;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  @OneToOne((type: any) => ProfileEntity, { onDelete: 'CASCADE' })
  @JoinColumn()
  profile: ProfileEntity;
}
