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
import { Contact } from '@lib/types/user.dto';
import { Profile } from '@lib/types/profile.dto';
//#endregion

@Entity('profile')
export class ProfileEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt?: Date | null;

  @UpdateDateColumn()
  updatedAt?: Date | null;

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
  loginIdentificator: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  username: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  dn: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  firstName: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  lastName: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  middleName: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  email: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 11,
  })
  birthday: string | null;

  @Column({
    type: 'int',
    nullable: true,
    default: Gender.UNKNOWN,
  })
  gender: Gender | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  country: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  postalCode: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  region: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  town: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  street: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  room: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  employeeID: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  company: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  management: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  department: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  division: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  title: string | null;

  @RelationId((profile: ProfileEntity) => profile.manager)
  managerId: string | null;

  @ManyToOne(() => ProfileEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinTable()
  manager: ProfileEntity | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  telephone: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  workPhone: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  mobile: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  fax: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  companyEng: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  nameEng: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  managementEng: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  departmentEng: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  divisionEng: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  positionEng: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  accessCard: string | null;

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
  thumbnailPhoto: string | Promise<string | null> | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  thumbnailPhoto40: string | Promise<string | null> | null;

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

  contact?: Contact;
  fullName?: string;
  @AfterLoad()
  setComputed(): void {
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
    this.contact = this.username ? Contact.USER : Contact.PROFILE;
  }

  toResponseObject = (): Profile => ({
    ...this,
    fullName: `${this.lastName || ''} ${this.firstName || ''} ${this.middleName || ''}`,
    contact: this.username ? Contact.USER : Contact.PROFILE,
  });
}
