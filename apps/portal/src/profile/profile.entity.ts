/** @format */
/* eslint max-classes-per-file:0 */

//#region Imports NPM
import { ObjectType, Field, ID, HideField } from '@nestjs/graphql';
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
  Index,
} from 'typeorm';
import isPromise from 'is-promise';
//#endregion
//#region Imports Local
import { Contact, Gender, LoginService } from '@back/shared/graphql';
import { ProfileBase } from './graphql/ProfileBase';
//#endregion

@ObjectType()
@Entity('profile')
@Index(['loginService', 'loginDomain'])
@Index(['loginService', 'loginDomain', 'loginGUID'])
@Index(['loginService', 'loginDomain', 'loginDN'])
@Index(['loginService', 'loginDomain', 'username'])
export class Profile implements ProfileBase {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Field(() => Boolean)
  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
  })
  disabled?: boolean;

  @Field(() => Boolean)
  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
  })
  notShowing?: boolean;

  @Field(() => Date, { nullable: true })
  @CreateDateColumn()
  createdAt?: Date | null;

  @Field(() => Date, { nullable: true })
  @UpdateDateColumn()
  updatedAt?: Date | null;

  @Field(() => LoginService)
  @Column({
    type: 'enum',
    enum: LoginService,
    nullable: false,
    default: LoginService.LOCAL,
  })
  loginService?: LoginService;

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

  @Field(() => String, { nullable: true })
  @Column({
    type: 'varchar',
    nullable: true,
  })
  loginDN?: string;

  @Field(() => String, { nullable: true })
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  username?: string;

  @Field(() => String, { nullable: true })
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  firstName?: string;

  @Field(() => String, { nullable: true })
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  lastName?: string;

  @Field(() => String, { nullable: true })
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  middleName?: string;

  @Field(() => String, { nullable: true })
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  email?: string;

  @Field(() => Date, { nullable: true })
  @Column({
    type: 'date',
    nullable: true,
  })
  birthday?: Date | null;

  @Field(() => Gender, { nullable: true })
  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
    default: Gender.UNKNOWN,
  })
  gender?: Gender;

  @Field(() => String, { nullable: true })
  @Column({
    type: 'varchar',
    nullable: true,
  })
  country?: string;

  @Field(() => String, { nullable: true })
  @Column({
    type: 'varchar',
    nullable: true,
  })
  postalCode?: string;

  @Field(() => String, { nullable: true })
  @Column({
    type: 'varchar',
    nullable: true,
  })
  region?: string;

  @Field(() => String, { nullable: true })
  @Column({
    type: 'varchar',
    nullable: true,
  })
  city?: string;

  @Field(() => String, { nullable: true })
  @Column({
    type: 'varchar',
    nullable: true,
  })
  street?: string;

  @Field(() => String, { nullable: true })
  @Column({
    type: 'varchar',
    nullable: true,
  })
  room?: string;

  @Field(() => String, { nullable: true })
  @Column({
    type: 'json',
    nullable: true,
  })
  addressPersonal?: string;

  @Field(() => String, { nullable: true })
  @Column({
    type: 'varchar',
    nullable: true,
  })
  company?: string;

  @Field(() => String, { nullable: true })
  @Column({
    type: 'varchar',
    nullable: true,
  })
  management?: string;

  @Field(() => String, { nullable: true })
  @Column({
    type: 'varchar',
    nullable: true,
  })
  department?: string;

  @Field(() => String, { nullable: true })
  @Column({
    type: 'varchar',
    nullable: true,
  })
  division?: string;

  @Field(() => String, { nullable: true })
  @Column({
    type: 'varchar',
    nullable: true,
  })
  title?: string;

  @Field(() => String, { nullable: true })
  @Column({
    type: 'varchar',
    nullable: true,
  })
  telephone?: string;

  @Field(() => String, { nullable: true })
  @Column({
    type: 'varchar',
    nullable: true,
  })
  workPhone?: string;

  @Field(() => String, { nullable: true })
  @Column({
    type: 'varchar',
    nullable: true,
  })
  mobile?: string;

  @Field(() => String, { nullable: true })
  @Column({
    type: 'varchar',
    nullable: true,
  })
  fax?: string;

  @Field(() => String, { nullable: true })
  @Column({
    type: 'varchar',
    nullable: true,
  })
  employeeID?: string;

  @Field(() => String, { nullable: true })
  @Column({
    type: 'varchar',
    nullable: true,
  })
  accessCard?: string;

  @Field(() => String, { nullable: true })
  @Column({
    type: 'varchar',
    nullable: true,
  })
  companyEng?: string;

  @Field(() => String, { nullable: true })
  @Column({
    type: 'varchar',
    nullable: true,
  })
  nameEng?: string;

  @Field(() => String, { nullable: true })
  @Column({
    type: 'varchar',
    nullable: true,
  })
  managementEng?: string;

  @Field(() => String, { nullable: true })
  @Column({
    type: 'varchar',
    nullable: true,
  })
  departmentEng?: string;

  @Field(() => String, { nullable: true })
  @Column({
    type: 'varchar',
    nullable: true,
  })
  divisionEng?: string;

  @Field(() => String, { nullable: true })
  @Column({
    type: 'varchar',
    nullable: true,
  })
  titleEng?: string;

  @HideField()
  @RelationId((profile: Profile) => profile.manager)
  managerId?: string | null;

  @Field(() => Profile, { nullable: true })
  @ManyToOne(() => Profile, { nullable: true, onDelete: 'SET NULL' })
  @JoinTable()
  manager?: Profile;

  @Field(() => String, { nullable: true })
  @Column({
    type: 'varchar',
    nullable: true,
  })
  thumbnailPhoto?: string | Promise<string | null> | null;

  @Field(() => String, { nullable: true })
  @Column({
    type: 'varchar',
    nullable: true,
  })
  thumbnailPhoto40?: string | Promise<string | null> | null;

  @Field(() => Contact, { nullable: true })
  contact?: Contact;

  @Field(() => String, { nullable: true })
  fullName?: string;

  @HideField()
  @BeforeUpdate()
  @BeforeInsert()
  async resizeImage(): Promise<void> {
    if (isPromise(this.thumbnailPhoto)) {
      this.thumbnailPhoto = await this.thumbnailPhoto;
    }

    if (isPromise(this.thumbnailPhoto40)) {
      this.thumbnailPhoto40 = await this.thumbnailPhoto40;
    }
  }

  @HideField()
  @AfterLoad()
  setComputed(): void {
    if (!this.fullName) {
      const f: Array<string> = [];
      if (this.lastName) {
        f.push(this.lastName);
      }
      if (this.firstName) {
        f.push(this.firstName);
      }
      if (this.middleName) {
        f.push(this.middleName);
      }
      this.fullName = f.join(' ');
    }
    if (!this.contact) {
      this.contact = typeof this.username === 'string' && this.username !== '' ? Contact.USER : Contact.PROFILE;
    }
  }
}
