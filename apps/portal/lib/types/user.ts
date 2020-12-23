/** @format */

//#region Imports NPM
//#endregion
//#region Imports Local
import { User } from '@back/user/user.entity';
import { Contact } from '@back/shared/graphql/Contact';
//#endregion

export interface AllUsersInfo {
  id?: string;
  loginDomain?: string;
  loginGUID?: string;
  name?: string;
  contact?: Contact;
  disabled?: boolean;
}

export const DefinedUserSettings = [
  'lng',
  'fontSize',
  'drawer',
  'phonebook',
  'task',
  'status',
  'favorites',
  'name',
  'priority',
  'route',
  'service',
  'where',
  'columns',
  'filters',
];
//#endregion

declare module 'express' {
  export interface Request {
    user: User;
  }
}

export interface MailSession {
  sessid: string;
  sessauth: string;
}

declare module 'express-session' {
  interface SessionData {
    passport: UserContext;
    password: string;
    mailSession: MailSession;
  }
}
//#endregion

//#region User context
export interface UserContext {
  user?: User;
  fontSize?: number;
  language?: string;
  isMobile?: boolean;
}
//#endregion
