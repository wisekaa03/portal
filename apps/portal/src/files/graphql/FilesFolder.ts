/** @format */

import { FileDetails } from 'nextcloud-link/compiled/source/types';
import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';

import { Folder } from './Folder';

@ObjectType()
export class FilesFolder implements Omit<FileDetails, 'isDirectory' | 'isFile' | 'href' | 'type'> {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  fileId!: string;

  @Field(() => Folder)
  type!: Folder;

  @Field({ nullable: true })
  mime!: string;

  @Field({ nullable: true })
  etag!: string;

  @Field()
  permissions!: string;

  @Field(() => Int)
  favorite!: number;

  @Field(() => Boolean)
  hasPreview!: boolean;

  @Field(() => Int)
  commentsUnread!: number;

  @Field(() => Int)
  commentsCount!: number;

  @Field()
  ownerId!: string;

  @Field()
  ownerDisplayName!: string;

  @Field()
  mount!: string;

  @Field(() => Date, { nullable: true })
  creationDate!: Date;

  @Field(() => Date)
  lastModified!: Date;

  @Field(() => Float)
  size!: number;

  @Field(() => String, { nullable: true })
  extraProperties!: Record<string, any>;

  @Field(() => [String], { nullable: true })
  resourceType?: string[];

  @Field(() => [String], { nullable: true })
  shareTypes?: string[];

  @Field({ nullable: true })
  sharePermissions?: string;
}
