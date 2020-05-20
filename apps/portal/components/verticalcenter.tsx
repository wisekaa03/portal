/** @format */

//#region Imports NPM
import React from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
//#endregion
//#region Imports Local
//#endregion

const useStyles = makeStyles(() =>
  createStyles({
    horizontal: {
      justifyContent: 'center',
      textAlign: 'center',
    },
    vertical: {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      height: '100%',
    },
  }),
);

interface VerticalCenterParams {
  horizontal?: boolean;
}

export const VerticalCenter: React.FC<VerticalCenterParams> = ({ horizontal = true, children }) => {
  const classes: any = useStyles({});

  return (
    <div
      className={clsx(classes.vertical, {
        [classes.horizontal]: horizontal,
      })}
    >
      {children}
    </div>
  );
};
