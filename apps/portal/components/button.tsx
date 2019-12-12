/** @format */
import React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Button, { ButtonProps } from '@material-ui/core/Button';
import clsx from 'clsx';
import HighlightOffIcon from '@material-ui/icons/HighlightOffOutlined';
import CheckCircleIcon from '@material-ui/icons/CheckCircleOutlined';

export interface ButtonBaseProps extends ButtonProps {
  actionType: 'accept' | 'cancel';
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    accept: {
      'color': theme.palette.getContrastText('#DEECEC'),
      'backgroundColor': '#DEECEC',
      'borderRadius': theme.spacing(3),
      '&:hover': {
        backgroundColor: '#BECDCD',
      },
    },
    cancel: {
      'color': theme.palette.getContrastText('#ECDEDE'),
      'backgroundColor': '#ECDEDE',
      'borderRadius': theme.spacing(3),
      '&:hover': {
        backgroundColor: '#D9C0C0',
      },
    },
  }),
);

const BaseButton = ({ actionType, children, className, ...rest }: ButtonBaseProps): React.ReactElement => {
  const classes = useStyles({});
  const Icon = actionType === 'accept' ? <CheckCircleIcon /> : <HighlightOffIcon />;

  return (
    <Button {...rest} variant="contained" startIcon={Icon} className={clsx(classes[actionType], className)}>
      {children}
    </Button>
  );
};

export default BaseButton;
