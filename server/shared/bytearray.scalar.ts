/** @format */

// #region Imports NPM
import { Scalar } from '@nestjs/graphql';
import { Kind } from 'graphql';
import { Base64 } from 'js-base64';
// #endregion

@Scalar('ByteArray')
export class ByteArrayScalar {
  description = 'Byte array scalar type';

  parseValue(value: string): Buffer {
    // eslint-disable-next-line no-debugger
    // debugger;

    return Buffer.from(Base64.atob(value));
  }

  serialize(value: Buffer): string {
    // eslint-disable-next-line no-debugger
    // debugger;

    return Base64.btoa(value.toString());
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
