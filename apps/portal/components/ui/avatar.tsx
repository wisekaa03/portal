/** @format */

// #region Imports NPM
import React from 'react';
import AvatarMui from '@material-ui/core/Avatar';
// #endregion
// #region Imports Local
import { Profile } from '../../src/profile/models/profile.dto';
import Alien from '../../../../public/images/svg/photo/alien-blue.svg';
import Man from '../../../../public/images/svg/photo/man-blue.svg';
import Woman from '../../../../public/images/svg/photo/woman-blue.svg';
// #endregion

interface AvatarProps {
  profile?: Profile;
  alt: string;
  base64?: string;
  fullSize?: boolean;
  className?: string;
}

const Avatar = ({ profile, fullSize = false, base64, ...rest }: AvatarProps): React.ReactElement => {
  let src = 'data:image/png;base64,';

  if (base64) {
    return <AvatarMui src={src + base64} {...rest} />;
  }

  if (!profile) {
    return <AvatarMui src={Alien} {...rest} />;
  }

  const { gender, thumbnailPhoto40, thumbnailPhoto } = profile;
  const photo = fullSize ? thumbnailPhoto : thumbnailPhoto40;

  src = photo ? src + photo : gender === 1 ? Man : gender === 2 ? Woman : Alien;

  return <AvatarMui src={src} {...rest} />;
};

export default Avatar;
