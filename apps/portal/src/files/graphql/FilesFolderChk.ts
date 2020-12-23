/** @format */

import { ObjectType, Field } from '@nestjs/graphql';
import { FilesFolder } from './FilesFolder';

@ObjectType()
export class FilesFolderChk extends FilesFolder {
  @Field(() => Boolean)
  checked!: boolean;
}
