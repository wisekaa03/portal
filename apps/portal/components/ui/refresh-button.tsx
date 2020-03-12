/** @format */

// #region Imports NPM
import React from 'react';
import IconButton, { IconButtonProps } from '@material-ui/core/IconButton';
import SyncIcon from '@material-ui/icons/Sync';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
// #endregion
// #region Imports Local
// #endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      'opacity': 0.6,
      'transition': `all 200ms ${theme.transitions.easing.easeOut} 0ms`,

      '&:hover': {
        opacity: 1,
      },
    },
    absolute: {
      position: 'absolute',
      top: '65px',
      right: '5px',
      zIndex: 100,
    },
    background: {
      'color': theme.palette.secondary.main,

      '&:hover': {
        color: '#fff',
        backgroundColor: theme.palette.secondary.main,
      },
    },
    dense: {
      padding: theme.spacing(0.5),
    },
  }),
);

interface RefreshButtonProps extends IconButtonProps {
  noAbsolute?: boolean;
  disableBackground?: boolean;
  dense?: boolean;
}

const RefreshButton = ({ onClick, noAbsolute, disableBackground, dense }: RefreshButtonProps): React.ReactElement => {
  const classes = useStyles({});

  return (
    <IconButton
      className={clsx(classes.root, {
        [classes.absolute]: !noAbsolute,
        [classes.background]: !disableBackground,
        [classes.dense]: dense,
      })}
      onClick={onClick}
      aria-label="refresh"
    >
      <SyncIcon />
    </IconButton>
  );
};

export default RefreshButton;
