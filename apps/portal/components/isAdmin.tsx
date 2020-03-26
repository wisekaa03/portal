/** @format */

// #region Imports NPM
import React, { useContext } from 'react';
// #endregion
// #region Imports Local
import { ProfileContext } from '@lib/context';
// #endregion

const IsAdmin = ({ children }: any): React.ReactElement => {
  const profile = useContext(ProfileContext);

  return profile?.user?.isAdmin ? children : <></>;
};

// IsAdmin.displayName = 'IsAdmin';

export default IsAdmin;
