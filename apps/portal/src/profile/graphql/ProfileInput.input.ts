/** @format */

import { InputType, Field, ID } from '@nestjs/graphql';
import { Contact, Gender } from '@back/shared/graphql';
import { ProfileBase } from './ProfileBase';

@InputType()
export class ProfileInput implements ProfileBase {
  @Field(() => String, { nullable: true })
  id?: string;

  @Field(() => Boolean, { nullable: true })
  disabled?: boolean;

  @Field(() => Boolean, { nullable: true })
  notShowing?: boolean;

  @Field(() => String, { nullable: true })
  username?: string;

  @Field(() => String, { nullable: true })
  firstName?: string;

  @Field(() => String, { nullable: true })
  lastName?: string;

  @Field(() => String, { nullable: true })
  middleName?: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => Date, { nullable: true })
  birthday?: Date;

  @Field(() => Gender, { nullable: true })
  gender?: Gender;

  @Field(() => String, { nullable: true })
  country?: string;

  @Field(() => String, { nullable: true })
  postalCode?: string;

  @Field(() => String, { nullable: true })
  region?: string;

  @Field(() => String, { nullable: true })
  city?: string;

  @Field(() => String, { nullable: true })
  street?: string;

  @Field(() => String, { nullable: true })
  room?: string;

  @Field(() => String, { nullable: true })
  addressPersonal?: string;

  @Field(() => String, { nullable: true })
  company?: string;

  @Field(() => String, { nullable: true })
  management?: string;

  @Field(() => String, { nullable: true })
  department?: string;

  @Field(() => String, { nullable: true })
  division?: string;

  @Field(() => String, { nullable: true })
  title?: string;

  @Field(() => String, { nullable: true })
  telephone?: string;

  @Field(() => String, { nullable: true })
  workPhone?: string;

  @Field(() => String, { nullable: true })
  mobile?: string;

  @Field(() => String, { nullable: true })
  fax?: string;

  @Field(() => String, { nullable: true })
  employeeID?: string;

  @Field(() => String, { nullable: true })
  accessCard?: string;

  @Field(() => String, { nullable: true })
  companyEng?: string;

  @Field(() => String, { nullable: true })
  nameEng?: string;

  @Field(() => String, { nullable: true })
  managementEng?: string;

  @Field(() => String, { nullable: true })
  departmentEng?: string;

  @Field(() => String, { nullable: true })
  divisionEng?: string;

  @Field(() => String, { nullable: true })
  titleEng?: string;

  @Field(() => Contact)
  contact?: Contact;
}
