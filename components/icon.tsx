/** @format */
import React from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import Icon from '@material-ui/core/Icon';

const iconWidth = 24;

const useStyles = makeStyles(() =>
  createStyles({
    root: { width: iconWidth, height: iconWidth },
  }),
);

interface IconProps {
  src: any;
}

export default (props: IconProps): React.ReactElement => {
  const classes = useStyles({});

  return (
    <Icon>
      <img className={classes.root} {...props} alt="icon" />
    </Icon>
  );
};
