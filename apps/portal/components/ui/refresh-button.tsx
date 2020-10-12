/** @format */

//#region Imports NPM
import React, { FC } from 'react';
import IconButton, { IconButtonProps } from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import SyncIcon from '@material-ui/icons/Sync';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
//#endregion
//#region Imports Local
import ServicesSyncIcon from '@images/svg/icons/wait_services.svg'; // ?inline
import { useTranslation } from '@lib/i18n-client';
import { Icon } from './icon';
//#endregion

export enum RefreshWhere {
  Default,
  Service,
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    'root': {
      'color': theme.palette.secondary.main,
      'opacity': 0.6,
      'transition': `all 200ms ${theme.transitions.easing.easeOut} 0ms`,

      '&:hover': {
        opacity: 1,
      },
    },
    'loading': {
      animation: '1s linear 0s normal non infinite running rot',
    },
    '@global': {
      '@keyframes rot': {
        '0%': {
          transform: 'rotate(0deg)',
        },
        '100%': {
          transform: 'rotate(360deg)',
        },
      },
    },
    'absolute': {
      position: 'absolute',
      top: '5px',
      right: '5px',
      zIndex: 100,
    },
    'background': {
      '&:hover': {
        color: '#fff',
        backgroundColor: theme.palette.secondary.main,
      },
    },
    'dense': {
      padding: theme.spacing(0.5),
    },
  }),
);

interface RefreshButtonProps extends IconButtonProps {
  loading?: boolean;
  noAbsolute?: boolean;
  disableBackground?: boolean;
  dense?: boolean;
  where?: RefreshWhere;
  onClick: () => void;
}

const RefreshButton: FC<RefreshButtonProps> = ({
  onClick,
  loading = true,
  noAbsolute,
  disableBackground,
  where,
  dense,
}): React.ReactElement => {
  const classes = useStyles({});
  const { t } = useTranslation();
  let icon: React.ReactElement;

  switch (where) {
    case RefreshWhere.Service:
      icon = <Icon src={ServicesSyncIcon} />;
      break;
    default:
      icon = <SyncIcon />;
  }
  return (
    <Tooltip title={t('common:refresh') || ''}>
      <IconButton
        className={clsx(classes.root, {
          [classes.absolute]: !noAbsolute,
          [classes.background]: !disableBackground,
          [classes.dense]: dense,
          [classes.loading]: loading,
        })}
        onClick={() => onClick()}
        aria-label="refresh"
      >
        {icon}
      </IconButton>
    </Tooltip>
  );
};

export default RefreshButton;
