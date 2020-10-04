/** @format */

//#region Import NPM
import { createContext } from 'react';
//#endregion
//#region Imports Local
import { FilesHeaderContextProps, PhonebookHeaderContextProps, UserContext } from '@lib/types';
//#endregion

/**
 * Yes the user object is stored in Apollo state but we don't want to have to
 * use <Query query={FETCH_CURRENT_USER}></Query> plus render props for
 * EVERY component that needs access to it. So we only do that once here, near
 * the top, then put the user object in React Context for ease of access.
 */
export const ProfileContext = createContext<UserContext>({});

export const PhonebookHeaderContext = createContext<PhonebookHeaderContextProps | undefined>(undefined);

export const FilesHeaderContext = createContext<FilesHeaderContextProps | undefined>(undefined);
