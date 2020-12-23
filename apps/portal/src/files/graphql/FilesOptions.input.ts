/** @format */

import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class FilesOptionsInput {
  @Field({ nullable: true })
  sync?: boolean;
}
