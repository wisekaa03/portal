/** @format */

import type { IncomingMessage } from 'http';
import type WebSocket from 'ws';
import type { User } from '@lib/types';

export interface LoggerContext {
  [key: string]: string | undefined | null;
}

export interface PortalWebsocket {
  user: User;
  req: IncomingMessage;
  socket: WebSocket;
}

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
