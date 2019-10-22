/** @format */

// #region Imports NPM
import React from 'react';
import AvatarMui from '@material-ui/core/Avatar';
// #endregion
// #region Imports Local
import { Profile } from '../server/profile/models/profile.dto';
// #endregion

interface AvatarProps {
  profile: Profile;
  className?: string;
}

export const Avatar = (props: AvatarProps): React.ReactElement => {
  const { profile, ...rest } = props;
  const { thumbnailPhoto: photo = null, gender } = profile;

  const path = '/public/images/jpeg/photo';
  const src = photo
    ? `data:image/png;base64,${photo}`
    : `${path}/${gender === 1 ? 'man' : gender === 2 ? 'woman' : 'alien'}.jpg`;

  return <AvatarMui src={src} {...rest} />;
};
