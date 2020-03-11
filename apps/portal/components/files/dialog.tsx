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
  Button,
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
import { FILE, EDIT_FILE, DELETE_FILE, EDIT_FOLDER, FOLDER, DELETE_FOLDER } from '../../lib/queries';
import { FILES_SHARED_NAME } from '../../lib/constants';
import { useTranslation } from '../../lib/i18n-client';
// #endregion

const FilesDialogComponent: FC<FilesDialogComponentProps> = ({ open, input, handleInput, handleClose }) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Subscribe</DialogTitle>
      <DialogContent>
        {/* <DialogContentText>
          To subscribe to this website, please enter your email address here. We will send updates
          occasionally.
        </DialogContentText> */}
        <TextField
          color="secondary"
          variant="outlined"
          autoFocus
          margin="dense"
          fullWidth
          onChange={handleInput}
          value={input}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleClose} color="primary">
          Subscribe
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FilesDialogComponent;
