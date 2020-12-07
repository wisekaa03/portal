/** @format */

//#region Imports NPM
import React from 'react';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { LinearProgress, CircularProgress, Box } from '@material-ui/core';
import clsx from 'clsx';
//#endregion
//#region Imports Local
import ConditionalWrapper from '@lib/conditional-wrapper';
import SyncIcon from '@public/images/svg/icons/wait_servers.svg';
//#endregion

export enum LoadingWhere {
  Default,
  Service,
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    loading: {
      color: 'red',
    },
    margin: {
      margin: theme.spacing(2),
    },
    fixed: {
      display: 'block',
      position: 'fixed',
      width: '100%',
    },
    absolute: {
      display: 'flex',
      height: '100%',
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
  }),
);

interface LoadingComponentProps {
  service?: boolean;
  activate?: boolean;
  variant?: 'determinate' | 'indeterminate' | 'static' | 'buffer' | 'query';
  disableShrink?: boolean;
  size?: number;
  thickness?: number;
  color?: 'primary' | 'secondary' | 'inherit';
  type?: 'linear' | 'circular';
  full?: boolean;
  wrapperClasses?: string;
  noMargin?: boolean;
  absolute?: boolean;
  children?: any;
}

const LoadingComponent: React.FC<LoadingComponentProps> = ({
  service = true,
  activate = true,
  variant,
  disableShrink,
  size,
  thickness,
  color,
  type,
  noMargin,
  full = false,
  wrapperClasses,
  absolute,
  children,
}) => {
  const classes = useStyles({});

  if (!activate) {
    return (children && React.Children.map(children, (child) => <>{child}</>)) ?? null;
  }

  if (type === 'linear') {
    const className = clsx(classes.loading, {
      [classes.margin]: !noMargin,
      [classes.fixed]: noMargin,
    });

    return (
      <LinearProgress
        variant={(variant as 'determinate' | 'indeterminate' | 'buffer' | 'query') || 'indeterminate'}
        className={className}
      />
    );
  }

  if (service) {
    return (
      <ConditionalWrapper
        condition={full}
        wrapper={(child) => <Box className={clsx(wrapperClasses, { [classes.absolute]: absolute })}>{child}</Box>}
      >
        <img style={{ width: size || '10em' }} alt="Waiting..." src={SyncIcon} />
      </ConditionalWrapper>
    );
  }

  return (
    <ConditionalWrapper
      condition={full}
      wrapper={(child) => <Box className={clsx(wrapperClasses, { [classes.absolute]: absolute })}>{child}</Box>}
    >
      <CircularProgress
        color={color || 'primary'}
        variant={(variant as 'determinate' | 'indeterminate') || 'indeterminate'}
        disableShrink={disableShrink || false}
        size={size || 24}
        thickness={thickness || 4}
        className={clsx({
          [classes.margin]: !noMargin,
        })}
      />
    </ConditionalWrapper>
  );
};

export default LoadingComponent;
