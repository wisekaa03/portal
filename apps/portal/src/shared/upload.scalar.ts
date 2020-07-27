/** @format */

//#region Imports NPM
import { Scalar, CustomScalar } from '@nestjs/graphql';
import { GraphQLUpload } from 'graphql-upload';
import { ValueNode } from 'graphql';
import { Maybe } from 'graphql/jsutils/Maybe';
//#endregion
//#region Imports Local
//#endregion

@Scalar('Upload')
export class Upload implements CustomScalar<unknown, unknown> {
  description = 'Upload custom scalar type';

  parseValue(value: unknown): unknown {
    return GraphQLUpload.parseValue(value);
  }

  serialize(value: unknown): unknown {
    return GraphQLUpload.serialize(value);
  }

  parseLiteral(ast: ValueNode, variables: Maybe<{ [key: string]: unknown }>): unknown {
    return GraphQLUpload.parseLiteral(ast, variables);
  }
}
