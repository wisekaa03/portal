/** @format */

// #region Imports NPM
import { Scalar } from '@nestjs/graphql';
import { Kind } from 'graphql';
import dayjs from 'dayjs';
// #endregion

@Scalar('Date')
export class DateScalar {
  description = 'Date scalar type';

  parseValue(value: any): Date {
    return new Date(value);
  }

  serialize(value: Date | string): Date | string {
    if (typeof value === 'string') {
      return new Date(value);
    }
    return dayjs(value).format('YYYY-MM-DD HH:mm:ss');
  }

  parseLiteral(ast: any): any {
    if (ast.kind === Kind.STRING) {
      return ast.value;
    }
    return null;
  }
}
