/** @format */

//#region Imports NPM
import React from 'react';
import IconButton, { IconButtonProps } from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import SyncIcon from '@material-ui/icons/Sync';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
//#endregion
//#region Imports Local
import { useTranslation } from '@lib/i18n-client';
//#endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      'color': theme.palette.secondary.main,
      'opacity': 0.6,
      'transition': `all 200ms ${theme.transitions.easing.easeOut} 0ms`,

      '&:hover': {
        opacity: 1,
      },
    },
    absolute: {
      position: 'absolute',
      top: '5px',
      right: '5px',
      zIndex: 100,
    },
    background: {
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
  onClick: () => void;
}

const RefreshButton = ({ onClick, noAbsolute, disableBackground, dense }: RefreshButtonProps): React.ReactElement => {
  const classes = useStyles({});
  const { t } = useTranslation();

  return (
    <Tooltip title={t('common:refresh') || ''}>
      <IconButton
        className={clsx(classes.root, {
          [classes.absolute]: !noAbsolute,
          [classes.background]: !disableBackground,
          [classes.dense]: dense,
        })}
        onClick={() => onClick()}
        aria-label="refresh"
      >
        <SyncIcon />
      </IconButton>
    </Tooltip>
  );
};

export default RefreshButton;
