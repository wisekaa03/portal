/** @format */
/* eslint-disable max-classes-per-file */

import { Field, ObjectType, Int } from '@nestjs/graphql';
import { Type } from '@nestjs/common';

export function Paginated<T>(classRef: Type<T>): any {
  @ObjectType(`${classRef?.name ?? ''}Edge`)
  abstract class EdgeType {
    @Field(() => String)
    cursor!: string;

    @Field(() => classRef)
    node!: T;
  }

  @ObjectType(`${classRef?.name ?? ''}PageInfo`)
  abstract class PageInfo {
    @Field({ nullable: true })
    startCursor?: string;

    @Field({ nullable: true })
    endCursor?: string;

    @Field(() => Boolean, { nullable: true })
    hasNextPage?: boolean;

    @Field(() => Boolean, { nullable: true })
    hasPreviousPage?: boolean;
  }

  @ObjectType({ isAbstract: true })
  abstract class PaginatedType {
    @Field(() => [EdgeType], { nullable: true })
    edges?: EdgeType[];

    // @Field(() => [classRef], { nullable: true })
    // nodes?: T[];

    @Field(() => PageInfo, { nullable: true })
    pageInfo?: PageInfo;

    @Field(() => Int)
    totalCount!: number;

    // @Field(() => Boolean)
    // hasNextPage!: boolean;
  }

  return PaginatedType;
}
