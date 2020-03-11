/** @format */

// #region Imports NPM
import React, { FC } from 'react';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { Box, Fab } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
// #endregion
// #region Imports Local
import { FilesComponentProps } from './types';
import IsAdmin from '../isAdmin';
import { useTranslation } from '../../lib/i18n-client';
import Loading from '../loading';
import Dropzone from '../dropzone';
import FilesTreeComponent from './tree';
import FilesDialogComponent from './dialog';
// #endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dropBox: {
      padding: theme.spacing(1, 2),
    },
    firstBlock: {
      display: 'grid',
      gap: `${theme.spacing(2)}px`,
      width: '100%',
      [theme.breakpoints.up('lg')]: {
        gridTemplateColumns: '1fr 1fr',
      },
    },
    sharedOrUser: {
      flexDirection: 'row',
    },
    treeView: {
      textAlign: 'left',
    },
    fab: {
      position: 'absolute',
      bottom: theme.spacing(2),
      right: 18 + theme.spacing(2),
    },
  }),
);

const FilesComponent: FC<FilesComponentProps> = ({
  fileLoading,
  folderLoading,
  fileData,
  folderData,
  folderName,
  setFolderName,
  showDropzone,
  handleOpenDropzone,
  handleEditFolder,
  handleDeleteFolder,
  openFolderDialog,
  handleCloseFolderDialog,
  folderDialogName,
  handleFolderDialogName,
  attachments,
  setAttachments,
  handleUploadFile,
}) => {
  const classes = useStyles({});
  const { t } = useTranslation();

  return (
    <Box display="flex" flexDirection="column">
      <Loading activate={fileLoading} noMargin type="linear" variant="indeterminate">
        <>
          {/* <Box display="flex" flexDirection="column" pt={2} px={2} pb={1} overflow="auto">
            <Box display="flex" mb={1}>
              <Box flex={1} display="flex" alignItems="center" justifyContent="flex-end">
                <Button onClick={handleUploadFile}>{t(`media:${current ? 'edit' : 'add'}`)}</Button>
              </Box>
            </Box>
          </Box> */}
          <Box display="flex" className={classes.dropBox} flexDirection="column">
            <Loading activate={folderLoading} full color="secondary">
              <>
                <FilesTreeComponent
                  data={folderData}
                  item={folderName}
                  setItem={setFolderName}
                  handleEdit={handleEditFolder}
                  handleDelete={handleDeleteFolder}
                />
                <FilesDialogComponent
                  open={openFolderDialog}
                  handleClose={handleCloseFolderDialog}
                  input={folderDialogName}
                  handleInput={handleFolderDialogName}
                />
              </>
            </Loading>
          </Box>
          {showDropzone && (
            <Box display="flex" className={classes.dropBox} flexDirection="column">
              <Dropzone files={attachments} setFiles={setAttachments} color="secondary" />
            </Box>
          )}
          <IsAdmin>
            {!showDropzone && (
              <Fab color="primary" className={classes.fab} aria-label="add" onClick={handleOpenDropzone}>
                <AddIcon />
              </Fab>
            )}
          </IsAdmin>
        </>
      </Loading>
    </Box>
  );
};

export default FilesComponent;
