/** @format */

//#region Imports NPM
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
  RelationId,
  AfterLoad,
} from 'typeorm';
//#endregion
//#region Imports Local
import { Gender } from '@lib/types/gender';
import { LoginService } from '@lib/types/login-service';
//#endregion

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
  dn: string;

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
  room: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  employeeID: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  company: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  management?: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  department?: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  division?: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  title: string;

  @RelationId((profile: ProfileEntity) => profile.manager)
  managerId?: string;

  @ManyToOne(() => ProfileEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinTable()
  manager?: ProfileEntity | undefined;

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
  fax: string;

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
  managementEng: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  departmentEng: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  divisionEng: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  positionEng: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  accessCard: string;

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
    if (this.thumbnailPhoto instanceof Promise) {
      this.thumbnailPhoto = await this.thumbnailPhoto;
    }

    if (this.thumbnailPhoto40 instanceof Promise) {
      this.thumbnailPhoto40 = await this.thumbnailPhoto40;
    }
  }

  fullName?: string;

  toResponseObject = (): ProfileEntity => ({
    ...this,
    fullName: `${this.lastName || ''} ${this.firstName || ''} ${this.middleName || ''}`,
  });
}
