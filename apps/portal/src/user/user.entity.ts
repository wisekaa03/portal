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
  ManyToMany,
  JoinTable,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
// #endregion
// #region Imports Local
import { UserSettings, MailSessionProps } from './models/user.dto';
import { ProfileEntity } from '../profile/profile.entity';
import { GroupEntity } from '../group/group.entity';
import { LoginService } from '../shared/interfaces';
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  @ManyToMany((type) => GroupEntity, { eager: true, cascade: ['update'], nullable: true })
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  @OneToOne((type: any) => ProfileEntity)
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

// #region User response
export interface UserResponse extends UserEntity {
  session: string;
  mailSession?: MailSessionProps;
}
// #endregion
