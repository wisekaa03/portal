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
} from 'typeorm';
// #endregion
// #region Imports Local
import { Profile } from './models/profile.dto';
import { LoginService, Gender, Address } from '../../lib/types';
import { ImageService } from '../image/image.service';
// eslint-disable-next-line import/no-cycle
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
    length: 100,
    nullable: true,
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
    nullable: true,
    default: Gender.UNKNOWN,
  })
  gender: Gender;

  @Column({
    type: 'json',
    nullable: true,
  })
  addressPersonal: Address;

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
  })
  disabled: boolean;

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
      this.thumbnailPhoto40 = this.thumbnailPhoto ? await this.thumbnailPhoto40 : undefined;
    }
  }

  toResponseObject = (): Profile => ({ ...this });
}
