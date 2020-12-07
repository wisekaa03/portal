/** @format */

import type { ApolloError } from '@apollo/client';

export interface PortalErrorsProps {
  errors?: ApolloError | (ApolloError | undefined)[];
}
