/** @format */
import React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Icon from '@material-ui/core/Icon';

const iconWidth = 24;

interface IconProps {
  src?: string;
  hover?: string;
}

const useStyles = makeStyles<Theme | undefined, IconProps>(() =>
  createStyles({
    root: (props) => ({
      'width': iconWidth,
      'height': iconWidth,
      'content': props.src ? `url(${props.src})` : undefined,

      '&:hover': {
        content: props.hover ? `url(${props.hover})` : undefined,
      },
    }),
  }),
);

const BaseIcon = (props: IconProps): React.ReactElement => {
  const classes = useStyles(props);

  return (
    <Icon>
      <img className={classes.root} alt="icon" />
    </Icon>
  );
};

export default BaseIcon;
