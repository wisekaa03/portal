/** @format */

import React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Button, { ButtonProps } from '@material-ui/core/Button';
import clsx from 'clsx';
import HighlightOffIcon from '@material-ui/icons/HighlightOffOutlined';
import CheckCircleIcon from '@material-ui/icons/CheckCircleOutlined';
import SaveOutlinedIcon from '@material-ui/icons/SaveOutlined';
import PrintOutlinedIcon from '@material-ui/icons/PrintOutlined';
import RestoreOutlinedIcon from '@material-ui/icons/RestoreOutlined';

export interface ButtonBaseProps extends ButtonProps {
  actionType?: 'accept' | 'cancel' | 'save' | 'print' | 'reset';
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      borderRadius: theme.spacing(3),
    },
    accept: {
      'color': theme.palette.getContrastText('#DEECEC'),
      'backgroundColor': '#DEECEC',

      '&:hover': {
        backgroundColor: '#BECDCD',
      },
    },
    cancel: {
      'color': theme.palette.getContrastText('#ECDEDE'),
      'backgroundColor': '#ECDEDE',

      '&:hover': {
        backgroundColor: '#D9C0C0',
      },
    },
    save: {
      'color': theme.palette.getContrastText('#dee4ec'),
      'backgroundColor': '#dee4ec',

      '&:hover': {
        backgroundColor: '#a9b6c7',
      },
    },
    print: {
      'color': theme.palette.getContrastText('#e2e2cd'),
      'backgroundColor': '#e2e2cd',

      '&:hover': {
        backgroundColor: '#c7c7a8',
      },
    },
    reset: {
      'color': theme.palette.getContrastText('#e6ccd9'),
      'backgroundColor': '#e6ccd9',

      '&:hover': {
        backgroundColor: '#d2adbf',
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
