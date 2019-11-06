/** @format */
import React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Icon from '@material-ui/core/Icon';

const iconWidth = 24;

interface IconProps {
  src?: string;
  size?: number;
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

  return (
    <Icon>
      <img className={classes.root} alt="icon" {...props} />
    </Icon>
  );
};

export default BaseIcon;
