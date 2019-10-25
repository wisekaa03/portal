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
  ManyToOne,
  JoinTable,
} from 'typeorm';
// #endregion
// #region Imports Local
// eslint-disable-next-line import/no-cycle
import { Profile } from './models/profile.dto';
// eslint-disable-next-line import/no-cycle
import { LoginService, Gender } from '../../lib/types';
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
    nullable: true,
  })
  username: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  firstName: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  lastName: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  middleName: string;

  @Column({
    type: 'varchar',
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
    nullable: true,
    default: Gender.UNKNOWN,
  })
  gender: Gender;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  country: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  postalCode: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  region: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  town: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  street: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  company: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  department?: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  otdel?: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  title: string;

  @ManyToOne((_type: any) => ProfileEntity)
  @JoinTable()
  manager?: ProfileEntity | Promise<ProfileEntity | undefined>;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  telephone: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  workPhone: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  mobile: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  companyEng: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  nameEng: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  departmentEng: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  otdelEng: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  positionEng: string;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
  })
  disabled: boolean;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
  })
  notShowing: boolean;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  thumbnailPhoto?: string | Promise<string | undefined>;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  thumbnailPhoto40?: string | Promise<string | undefined>;

  @BeforeUpdate()
  @BeforeInsert()
  async resizeImage(): Promise<void> {
    if (
      typeof this.thumbnailPhoto === 'object' &&
      typeof ((this.thumbnailPhoto as unknown) as Record<string, any>).then === 'function'
    ) {
      this.thumbnailPhoto = this.thumbnailPhoto ? await this.thumbnailPhoto : undefined;
    }

    if (
      typeof this.thumbnailPhoto40 === 'object' &&
      typeof ((this.thumbnailPhoto40 as unknown) as Record<string, any>).then === 'function'
    ) {
      this.thumbnailPhoto40 = this.thumbnailPhoto ? await this.thumbnailPhoto40 : undefined;
    }

    if (
      typeof this.manager === 'object' &&
      typeof ((this.manager as unknown) as Record<string, any>).then === 'function'
    ) {
      ((this.manager as unknown) as ProfileEntity | undefined) = await this.manager;
    }
  }

  toResponseObject = (): ProfileEntity => ({ ...this });
}
