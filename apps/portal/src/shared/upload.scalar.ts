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
export class Upload implements CustomScalar<any, any> {
  description = 'Upload custom scalar type';

  parseValue(value: any): any {
    return GraphQLUpload.parseValue(value);
  }

  serialize(value: any): any {
    return GraphQLUpload.serialize(value);
  }

  parseLiteral(ast: ValueNode, variables: Maybe<{ [key: string]: any }>): any {
    return GraphQLUpload.parseLiteral(ast, variables);
  }
}
