/** @format */

//#region Imports NPM
import React, { FC } from 'react';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { TextField, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText } from '@material-ui/core';
//#endregion
//#region Imports Local
import { useTranslation } from '@lib/i18n-client';
import { FilesDialogComponentProps } from '@lib/types';
import Button from '@front/components/ui/button';
//#endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      minWidth: 600,
    },
  }),
);

const FilesDialogComponent: FC<FilesDialogComponentProps> = ({
  open,
  input,
  handleAccept,
  handleInput,
  handleClose,
}) => {
  const classes = useStyles({});
  const { t } = useTranslation();

  const title = open === 1 ? t('files:addFolder') : open === 2 ? t('files:editFolder') : t('files:deleteFolder');

  return (
    <Dialog open={open !== 0} onClose={handleClose} classes={{ paper: classes.paper }}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {open > 2 ? (
          <DialogContentText>{t('files:confirmDelete', { input })}</DialogContentText>
        ) : (
          <TextField
            color="secondary"
            variant="outlined"
            autoFocus
            margin="dense"
            fullWidth
            onChange={handleInput}
            value={input}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} actionType="cancel">
          {t('common:cancel')}
        </Button>
        <Button disabled={open < 3 && input.length < 4} onClick={() => handleAccept(open)}>
          {t('common:accept')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FilesDialogComponent;
