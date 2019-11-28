/** @format */
import React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Button, { ButtonProps } from '@material-ui/core/Button';
import { green, deepOrange } from '@material-ui/core/colors';
import clsx from 'clsx';

interface ButtonBaseProps extends ButtonProps {
  actionType: 'accept' | 'cancel';
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    accept: {
      'color': theme.palette.getContrastText(green[200]),
      'backgroundColor': green[200],
      'borderRadius': theme.spacing(),
      '&:hover': {
        backgroundColor: green[300],
      },
    },
    cancel: {
      'color': theme.palette.getContrastText(deepOrange[200]),
      'backgroundColor': deepOrange[200],
      'borderRadius': theme.spacing(),
      '&:hover': {
        backgroundColor: deepOrange[300],
      },
    },
  }),
);

const BaseButton = ({ actionType, children, className, ...rest }: ButtonBaseProps): React.ReactElement => {
  const classes = useStyles({});

  return (
    <Button {...rest} variant="contained" className={clsx(classes[actionType], className)}>
      {children}
    </Button>
  );
};

export default BaseButton;
