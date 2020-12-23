/** @format */

//#region Imports NPM
import { Kind, ValueNode } from 'graphql';
import { Scalar, CustomScalar } from '@nestjs/graphql';
//#endregion

@Scalar('ByteArray', () => Buffer)
export class ByteArray implements CustomScalar<string, Buffer | string> {
  description = 'Byte array scalar type';

  parseValue = (byteString: string): Buffer => Buffer.from(byteString, 'base64');

  serialize = (byteBuffer: Buffer): string => byteBuffer.toString('base64');

  parseLiteral(ast: ValueNode): Buffer | string | null {
    if (ast.kind === Kind.STRING) {
      return ast.value;
    }
    return null;
  }
}
