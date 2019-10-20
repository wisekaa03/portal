/** @format */

// #region Imports NPM
import { Scalar } from '@nestjs/graphql';
import { Kind } from 'graphql';
// #endregion

@Scalar('ByteArray')
export class ByteArrayScalar {
  description = 'Byte array scalar type';

  parseValue(value: string): Buffer {
    return Buffer.from(value, 'base64');
  }

  serialize(value: Buffer): string {
    return value.toString('base64');
  }

  parseLiteral(ast: any): any {
    if (ast.kind === Kind.STRING) {
      return ast.value;
    }
    return null;
  }
}
