/** @format */

import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class FilesFile {
  @Field()
  path!: string;

  @Field({ nullable: true })
  temporaryFile?: string;
}
