/** @format */

//#region Imports NPM
import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';
import { Maybe } from 'graphql/jsutils/Maybe';
//#endregion

@Scalar('Date')
export class DateScalar implements CustomScalar<number, Date> {
  description = 'Date scalar type';

  parseValue(value: number): Date {
    return new Date(value);
  }

  serialize(value?: Date | string): number | null {
    if (typeof value === 'string') {
      return new Date(value).getTime();
    }
    return value ? value.getTime() : null;
  }

  parseLiteral(ast: ValueNode, _variables: Maybe<{ [key: string]: any }>): Date | null {
    if (ast.kind === Kind.STRING || ast.kind === Kind.INT) {
      return new Date(ast.value);
    }
    return null;
  }
}
