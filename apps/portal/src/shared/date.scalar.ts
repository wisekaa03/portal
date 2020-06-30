/** @format */

//#region Imports NPM
import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind } from 'graphql';
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

  parseLiteral(ast: any): Date | null {
    if (ast.kind === Kind.STRING || ast.kind === Kind.INT) {
      return new Date(ast.value);
    }
    return null;
  }
}
