/** @format */

import type { UserSettings } from '@lib/types/user.dto';
import { TASK_STATUSES } from '@lib/constants';

export const ADMIN_GROUP = 'web master';

export const LDAP_SYNC = { cmd: 'sync' };
export const LDAP_SYNC_SERVICE = 'LDAP_SYNC_SERVICE';

export const TIMEOUT_REFETCH_SERVICES = 60000;
export const TIMEOUT = 20000;

export enum PortalPubSub {
  TICKETS_ROUTES = 'ticketsRoutes',
  TICKETS_TASKS = 'ticketsTasks',
  TICKETS_TASK = 'ticketsTask',
  DOCFLOW_TASKS = 'docflowTasks',
  DOCFLOW_TASK = 'docflowTask',
  DOCFLOW_TARGET = 'docflowTarget',
  DOCFLOW_INTERNAL_DOCUMENT = 'docflowInternalDocument',
}

export const defaultUserSettings: UserSettings = {
  lng: 'ru',
  drawer: true,
  task: {
    status: TASK_STATUSES[0],
    favorites: [],
  },
};
