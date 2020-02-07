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
}

const useStyles = makeStyles<Theme | undefined, IconProps>(() =>
  createStyles({
    root: (props) => ({
      width: props.size ? props.size : iconWidth,
      height: props.size ? props.size : iconWidth,
    }),
  }),
);

const BaseIcon = ({ size, ...props }: IconProps): React.ReactElement => {
  const classes = useStyles({ size });

  const otherProps: IconProps = {};

  if (props.material) {
    const TheIcon = props.src;
    return <TheIcon />;
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
