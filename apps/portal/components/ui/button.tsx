/** @format */

import React from 'react';
import { makeStyles, createStyles, Theme, darken } from '@material-ui/core/styles';
import Button, { ButtonProps } from '@material-ui/core/Button';
import clsx from 'clsx';
import HighlightOffIcon from '@material-ui/icons/HighlightOffOutlined';
import CheckCircleIcon from '@material-ui/icons/CheckCircleOutlined';
import SaveOutlinedIcon from '@material-ui/icons/SaveOutlined';
import PrintOutlinedIcon from '@material-ui/icons/PrintOutlined';
import RestoreOutlinedIcon from '@material-ui/icons/RestoreOutlined';
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined';
import StarBorderOutlinedIcon from '@material-ui/icons/StarBorderOutlined';

export interface ButtonBaseProps extends ButtonProps {
  actionType?: 'accept' | 'cancel' | 'save' | 'print' | 'reset' | 'close' | 'favorite';
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      borderRadius: theme.shape.borderRadius,
      padding: theme.spacing(1.5, 3),
    },
    accept: {
      'color': '#fff',
      'backgroundColor': '#6AA7C8',

      '&:hover': {
        backgroundColor: darken('#6AA7C8', 0.3),
      },
    },
    cancel: {
      'color': '#fff',
      'backgroundColor': theme.palette.error.main,

      '&:hover': {
        backgroundColor: darken(theme.palette.error.main, 0.3),
      },
    },
    save: {
      'color': '#fff',
      'backgroundColor': '#6AA7C8',

      '&:hover': {
        backgroundColor: darken('#6AA7C8', 0.3),
      },
    },
    print: {
      'color': '#fff',
      'backgroundColor': '#6AA7C8',

      '&:hover': {
        backgroundColor: darken('#6AA7C8', 0.3),
      },
    },
    reset: {
      'color': '#fff',
      'backgroundColor': theme.palette.error.main,

      '&:hover': {
        backgroundColor: darken(theme.palette.error.main, 0.3),
      },
    },
    close: {
      'color': '#fff',
      'backgroundColor': theme.palette.error.main,

      '&:hover': {
        backgroundColor: darken(theme.palette.error.main, 0.3),
      },
    },
    favorite: {
      'color': '#fff',
      'backgroundColor': '#6AA7C8',

      '&:hover': {
        backgroundColor: darken('#6AA7C8', 0.3),
      },
    },
  }),
);

const BaseButton = ({ actionType = 'accept', children, className, ...rest }: ButtonBaseProps): React.ReactElement => {
  const classes = useStyles({});
  let icon: JSX.Element;

  switch (actionType) {
    case 'cancel':
      icon = <HighlightOffIcon />;
      break;
    case 'save':
      icon = <SaveOutlinedIcon />;
      break;
    case 'print':
      icon = <PrintOutlinedIcon />;
      break;
    case 'reset':
      icon = <RestoreOutlinedIcon />;
      break;
    case 'close':
      icon = <CloseOutlinedIcon />;
      break;
    case 'favorite':
      icon = <StarBorderOutlinedIcon />;
      break;
    default:
      icon = <CheckCircleIcon />;
  }

  return (
    <Button
      {...rest}
      variant="contained"
      startIcon={icon}
      className={clsx(classes.root, classes[actionType], className)}
    >
      {children}
    </Button>
  );
};

export default BaseButton;
