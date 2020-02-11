/** @format */
import React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Icon from '@material-ui/core/Icon';

import NoImage from '../../../../public/images/svg/noimage.svg';

const iconWidth = 24;

interface IconProps {
  src?: any;
  base64?: boolean;
  size?: number;
  material?: boolean;
  mask?: string;
  color?: string;
}

const useStyles = makeStyles<Theme | undefined, IconProps>((theme) =>
  createStyles({
    root: ({ size }) => ({
      width: size || iconWidth,
      height: size || iconWidth,
    }),
    mask: ({ mask, color }) => ({
      '-webkit-mask-size': 'cover',
      '-webkit-mask': `url(${mask})`,
      'mask': `url(${mask})`,
      'background': color in theme.palette ? theme.palette[color].main : color,
    }),
  }),
);

const BaseIcon = ({ size, mask, color, ...props }: IconProps): React.ReactElement => {
  const classes = useStyles({ size, mask, color });

  const otherProps: IconProps = {};

  if (props.material) {
    const TheIcon = props.src;
    return <TheIcon />;
  }

  if (mask) {
    return <Icon className={classes.mask} />;
  }

  if (props.src) {
    otherProps.src = props.base64 ? `data:image/png;base64,${props.src}` : props.src;
  } else {
    otherProps.src = NoImage;
  }

  return (
    <Icon>
      <img className={classes.root} alt="icon" {...otherProps} />
    </Icon>
  );
};

export default BaseIcon;
