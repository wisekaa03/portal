/** @format */

import type React from 'react';
import type { ApolloQueryResult } from '@apollo/client';

import type { Data } from './common';

// refetchRoutes: () => Promise<ApolloQueryResult<Data<'TicketsRoutes', TkRoutes>>>;
// tasksRefetch: () => Promise<ApolloQueryResult<Data<'TicketsTasks', TkTasks>>>;
// refetch: (variables?: ProfileQueryProps) => Promise<ApolloQueryResult<Data<'profiles', Connection<Profile>>>>;
export type TResultImplProps = 'TicketsRoutes' | 'TicketsTasks' | 'profiles' | '';

export type RefreshComponentProps<TData = any, TResultImpl = TResultImplProps, TResult = any> = (
  variables?: TData,
) => Promise<ApolloQueryResult<Data<any, TResult>>> | undefined;

export interface MaterialUIProps<TData = any, TResultImpl = TResultImplProps, TResult = any> {
  refetchComponent?: RefreshComponentProps<TData, TResultImpl, TResult>;
  refetchLoading?: boolean;
}
