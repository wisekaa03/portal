/** @format */

import React, { useContext } from 'react';
import { ProfileContext } from '../lib/context';

const IsAdmin = ({ children }: any): React.ReactElement => {
  const profile = useContext(ProfileContext);

  return profile?.user?.isAdmin && React.Children.only(children);
};

IsAdmin.displayName = 'IsAdmin';

export default IsAdmin;
