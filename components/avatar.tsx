/** @format */
/* eslint prettier/prettier:0 */

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
  const { gender } = profile;

  const path = '/public/images/jpeg/photo';
  const src =
    (!fullSize && profile.thumbnailPhoto40) || profile.thumbnailPhoto
      ? `data:image/png;base64,${(!fullSize && profile.thumbnailPhoto40) || profile.thumbnailPhoto}`
      : gender === 1
        ? Man
        : gender === 2
          ? Woman
          : Alien;

  return <AvatarMui src={src} {...rest} />;
};
