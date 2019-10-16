/** @format */

// #region Imports NPM
import { Scalar } from '@nestjs/graphql';
import { Kind } from 'graphql';
// #endregion

@Scalar('ByteArray')
export class ByteArrayScalar {
  description = 'Byte array scalar type';

  parseValue(value: string): {} {
    // eslint-disable-next-line no-debugger
    // debugger;

    return Buffer.from(value);
  }

  serialize(value: Buffer): {} {
    // eslint-disable-next-line no-debugger
    // debugger;

    return value.toString();
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
