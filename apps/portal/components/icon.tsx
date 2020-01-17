/** @format */
import React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Icon from '@material-ui/core/Icon';

const iconWidth = 24;

interface IconProps {
  src?: any;
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

  if (props.material) {
    const TheIcon = props.src;
    return <TheIcon />;
  }

  return (
    <Icon>
      <img className={classes.root} alt="icon" {...props} />
    </Icon>
  );
};

export default BaseIcon;
