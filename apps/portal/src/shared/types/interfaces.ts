/** @format */

export interface GraphQLQueryInput {
  cache?: boolean;
}

export interface GraphQLMutationInput {
  cache?: boolean;
}

export interface SubscriptionPayload<T = any> {
  userId: string;
  object: T;
}
