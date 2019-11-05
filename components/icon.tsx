/** @format */
import React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Icon from '@material-ui/core/Icon';

const iconWidth = 24;

interface IconProps {
  src?: string;
}

const useStyles = makeStyles<Theme | undefined, IconProps>(() =>
  createStyles({
    root: {
      width: iconWidth,
      height: iconWidth,
    },
  }),
);

const BaseIcon = (props: IconProps): React.ReactElement => {
  const classes = useStyles({});

  return (
    <Icon>
      <img className={classes.root} alt="icon" {...props} />
    </Icon>
  );
};

export default BaseIcon;
