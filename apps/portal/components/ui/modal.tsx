/** @format */

//#region Imports NPM
import React, { FC } from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import { Modal as MuiModal } from '@material-ui/core';
//#endregion
//#region Imports Local
//#endregion

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  }),
);

interface ModalProps {
  open: boolean;
  onClose: () => void;
}

const Modal: FC<ModalProps> = ({ open, onClose, children }) => {
  const classes = useStyles({});

  return (
    <MuiModal open={open} onClose={onClose} className={classes.root}>
      <div>{children}</div>
    </MuiModal>
  );
};

export default Modal;
