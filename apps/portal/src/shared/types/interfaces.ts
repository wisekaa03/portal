/** @format */

import type { Request, Response } from 'express';
import type { IncomingMessage } from 'http';
import type WebSocket from 'ws';
import { User } from '@back/user/user.entity';

export interface EmailSession {
  error?: string;
  sessid?: string;
  sessauth?: string;
}

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
  websocket?: boolean;
}

export interface GraphQLMutationInput {
  cache?: boolean;
  setCache?: boolean;
}

export interface SubscriptionPayload<T = any> {
  userId: string;
  object: T;
}
