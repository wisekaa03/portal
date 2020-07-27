/** @format */

//#region Imports NPM
import { Kind, ValueNode } from 'graphql';
import { Scalar, CustomScalar } from '@nestjs/graphql';
//#endregion

@Scalar('ByteArray')
export class ByteArrayScalar implements CustomScalar<string, Buffer | string> {
  description = 'Byte array scalar type';

  parseValue = (value: string): Buffer => Buffer.from(value, 'base64');

  serialize = (value: Buffer): string => value.toString('base64');

  parseLiteral(ast: ValueNode): Buffer | string | null {
    if (ast.kind === Kind.STRING) {
      return ast.value;
    }
    return null;
  }
}
