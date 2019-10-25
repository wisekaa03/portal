/** @format */

// #region Imports NPM
import React from 'react';
import AvatarMui from '@material-ui/core/Avatar';
// #endregion
// #region Imports Local
import { Profile } from '../server/profile/models/profile.dto';
import Alien from '../public/images/svg/photo/alien.svg';
import Man from '../public/images/svg/photo/man.svg';
import Woman from '../public/images/svg/photo/woman.svg';
// #endregion

interface AvatarProps {
  profile: Profile;
  fullSize?: boolean;
  className?: string;
}

export const Avatar = (props: AvatarProps): React.ReactElement => {
  const { profile, fullSize = false, ...rest } = props;
  const { gender, thumbnailPhoto40, thumbnailPhoto } = profile;

  const photo = fullSize ? thumbnailPhoto : thumbnailPhoto40;

  const src = photo ? `data:image/png;base64,${photo}` : gender === 1 ? Man : gender === 2 ? Woman : Alien;

  return <AvatarMui src={src} {...rest} />;
};
