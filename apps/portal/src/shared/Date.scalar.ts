/** @format */

//#region Imports NPM
import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';
import { Maybe } from 'graphql/jsutils/Maybe';
//#endregion

@Scalar('Date', () => Date)
export class DateScalar implements CustomScalar<number, Date> {
  description = 'Date scalar type';

  parseValue(dateNumber: number): Date {
    return new Date(dateNumber);
  }

  serialize(dateString?: Date | string): number | null {
    if (typeof dateString === 'string') {
      return new Date(dateString).getTime();
    }
    return dateString ? dateString.getTime() : null;
  }

  parseLiteral(ast: ValueNode, _variables: Maybe<{ [key: string]: string | number }>): Date | null {
    if (ast.kind === Kind.STRING || ast.kind === Kind.INT) {
      return new Date(ast.value);
    }
    return null;
  }
}
