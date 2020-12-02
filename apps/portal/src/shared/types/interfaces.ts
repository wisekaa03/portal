/** @format */

import type { Request, Response } from 'express';
import type { IncomingMessage } from 'http';
import type WebSocket from 'ws';
import type { User } from '@lib/types';

export interface WebsocketContext {
  user: User;
  req: IncomingMessage;
  socket: WebSocket;
}

export interface GraphQLContext {
  user?: User;
  req: Request;
  res: Response;
}

export interface GraphQLQueryInput {
  cache?: boolean;
  setCache?: boolean;
}

export interface GraphQLMutationInput {
  cache?: boolean;
  setCache?: boolean;
}

export interface SubscriptionPayload<T = any> {
  userId: string;
  object: T;
}
