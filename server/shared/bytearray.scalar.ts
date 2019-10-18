/** @format */

// #region Imports NPM
import { Scalar } from '@nestjs/graphql';
import { Kind } from 'graphql';
// #endregion

@Scalar('ByteArray')
export class ByteArrayScalar {
  description = 'Byte array scalar type';

  parseValue(value: string): Buffer {
    // eslint-disable-next-line no-debugger
    // debugger;

    return Buffer.from(value, 'base64');
  }

  serialize(value: Buffer): string {
    // eslint-disable-next-line no-debugger
    // debugger;

    return value.toString('base64');
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
