/** @format */

export interface GraphQLQueryInput {
  cache?: boolean;
}

export interface GraphQLMutationInput {
  cache?: boolean;
}

export interface SubscriptionPayload {
  userId: string;
  object: any;
}
