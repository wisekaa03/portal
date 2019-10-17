/** @format */

// #region Imports NPM
import { Scalar } from '@nestjs/graphql';
import { Kind } from 'graphql';
// #endregion

@Scalar('Date')
export class DateScalar {
  description = 'Date scalar type';

  parseValue(value: any): Date {
    // eslint-disable-next-line no-debugger
    // debugger;

    return new Date(value);
  }

  serialize(value: Date | string): Date | string {
    // eslint-disable-next-line no-debugger
    // debugger;

    if (typeof value === 'string') {
      return new Date(value);
    }

    return value.toISOString();
  }

  parseLiteral(ast: any): any {
    // eslint-disable-next-line no-debugger
    // debugger;

    if (ast.kind === Kind.STRING) {
      return ast.value;
    }
    return null;
  }
}
