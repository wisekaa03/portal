/** @format */

//#region Imports NPM
import React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import BaseIcon from '@material-ui/core/Icon';
//#endregion
//#region Imports Local
import NoImage from '@images/svg/noimage.svg?inline';
//#endregion

const iconWidth = 24;

interface IconProps {
  src?: string | React.ReactSVGElement;
  base64?: boolean;
  size?: number;
  material?: boolean;
  mask?: string;
  color?: string;
}

const useStyles = makeStyles<Theme, IconProps, string>((theme: Theme) =>
  createStyles({
    root: ({ size }) => ({
      width: size || iconWidth,
      height: size || iconWidth,
      verticalAlign: 'middle',
    }),
    mask: ({ mask, color }) => ({
      '-webkit-mask-size': 'cover',
      '-webkit-mask': `url(${mask})`,
      'mask': `url(${mask})`,
      'background': color && color in theme.palette ? (theme.palette as any)[color].main : color,
    }),
  }),
);

export const Icon = ({ size, mask, color, src, base64 }: IconProps): React.ReactElement => {
  const classes = useStyles({ size, mask, color });

  if (mask) {
    return <BaseIcon className={classes.mask} />;
  }

  /* Material Icons */
  if (typeof src === 'object' && src !== null) {
    return src;
  }
  if (typeof src === 'string' && src !== null && src) {
    // <svg = base64: PHN2Z
    // <?xml = base64: PD94bW
    const baseType = src.match(/^(phn2z|pd94bw|<svg|<?xml)/i) ? 'data:image/svg+xml;base64,' : 'data:image/png;base64,';

    /* <Icon> */
    return <img className={classes.root} alt="icon" src={`${base64 ? baseType : ''}${src}`} />;
    /* </Icon> */
  }

  /* <Icon> */
  return <img className={classes.root} alt="icon" src={NoImage} />;
  /* </Icon> */
};
