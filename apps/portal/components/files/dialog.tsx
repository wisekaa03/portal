/** @format */

// #region Imports NPM
import React, { FC, useState } from 'react';
import { fade, Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { useMutation } from '@apollo/react-hooks';
import {
  Typography,
  TextField,
  IconButton,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@material-ui/core';
import MuiTreeView from '@material-ui/lab/TreeView';
import MuiTreeItem from '@material-ui/lab/TreeItem';
import DirectoryIcon from '@material-ui/icons/FolderRounded';
import EditIcon from '@material-ui/icons/EditRounded';
import DeleteIcon from '@material-ui/icons/DeleteRounded';
import AddIcon from '@material-ui/icons/AddCircleOutlineRounded';
import DoneIcon from '@material-ui/icons/DoneRounded';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
// #endregion
// #region Imports Local
import { FilesDialogComponentProps } from './types';
import Button from '../ui/button';
import { FILE, EDIT_FILE, DELETE_FILE, EDIT_FOLDER, FOLDER, DELETE_FOLDER } from '../../lib/queries';
import { FILES_SHARED_NAME } from '../../lib/constants';
import { useTranslation } from '../../lib/i18n-client';
// #endregion

const FilesDialogComponent: FC<FilesDialogComponentProps> = ({
  open,
  input,
  handleAccept,
  handleInput,
  handleClose,
}) => {
  const { t } = useTranslation();

  const title = open === 1 ? t('files:addFolder') : open === 2 ? t('files:editFolder') : t('files:deleteFolder');

  return (
    <Dialog open={open !== 0} onClose={handleClose}>
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
          {t('commom:cancel')}
        </Button>
        <Button onClick={() => handleAccept(open)}>{t('commom:accept')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default FilesDialogComponent;
