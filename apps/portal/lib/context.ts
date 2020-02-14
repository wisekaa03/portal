/** @format */

// #region Import NPM
import React from 'react';
// #endregion
// #region Imports Local
import { UserContext } from '../src/user/models/user.dto';
import { HeaderProps } from '../components/phonebook/types';
// #endregion

/**
 * Yes the user object is stored in Apollo state but we don't want to have to
 * use <Query query={FETCH_CURRENT_USER}></Query> plus render props for
 * EVERY component that needs access to it. So we only do that once here, near
 * the top, then put the user object in React Context for ease of access.
 */
export const ProfileContext = React.createContext<UserContext>({ user: undefined });

export const PhonebookHeaderContext = React.createContext<HeaderProps | undefined>(undefined);
// HeaderContext.displayName = 'HeaderContext';
