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
      // padding: theme.spacing(1.5, 3),
    },
    accept: {
      'color': '#31312F',
      'backgroundColor': '#ECA365',

      '&:hover': {
        backgroundColor: '#ECA365',
      },
    },
    cancel: {
      'color': '#31312F',
      'backgroundColor': '#CACACA',

      '&:hover': {
        backgroundColor: darken('#CACACA', 0.3),
      },
    },
    save: {
      'color': '#31312F',
      'backgroundColor': '#ECA365',

      '&:hover': {
        backgroundColor: '#ECA365',
      },
    },
    print: {
      'color': '#31312F',
      'backgroundColor': '#ECA365',

      '&:hover': {
        backgroundColor: '#ECA365',
      },
    },
    reset: {
      'color': '#31312F',
      'backgroundColor': '#B2BEC9',

      '&:hover': {
        backgroundColor: '#B3BCC6',
      },
    },
    close: {
      'color': '#31312F',
      'backgroundColor': '#B2BEC9',

      '&:hover': {
        backgroundColor: '#B3BCC6',
      },
    },
    favorite: {
      'color': '#31312F',
      'backgroundColor': '#ECA365',

      '&:hover': {
        backgroundColor: '#ECA365',
      },
    },
  }),
);

const BaseButton: React.FC<ButtonBaseProps> = ({ actionType = 'accept', children, className, ...rest }) => {
  const classes = useStyles({});

  // TODO: design changes...
  // let icon: React.ReactElement;
  // switch (actionType) {
  //   case 'cancel':
  //     icon = <HighlightOffIcon />;
  //     break;
  //   case 'save':
  //     icon = <SaveOutlinedIcon />;
  //     break;
  //   case 'print':
  //     icon = <PrintOutlinedIcon />;
  //     break;
  //   case 'reset':
  //     icon = <RestoreOutlinedIcon />;
  //     break;
  //   case 'close':
  //     icon = <CloseOutlinedIcon />;
  //     break;
  //   case 'favorite':
  //     icon = <StarBorderOutlinedIcon />;
  //     break;
  //   default:
  //     icon = <CheckCircleIcon />;
  // }

  return (
    <Button
      {...rest}
      variant="contained"
      // startIcon={icon}
      className={clsx(classes.root, classes[actionType], className)}
    >
      {children}
    </Button>
  );
};

export default BaseButton;
