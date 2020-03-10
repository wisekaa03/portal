/** @format */

// #region Imports NPM
import React, { FC } from 'react';
import Link from 'next/link';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { Box, Fab } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
// #endregion
// #region Imports Local
import Button from '../ui/button';
import { useTranslation } from '../../lib/i18n-client';
import Loading from '../loading';
import Dropzone from '../dropzone';
import { MediaComponentProps } from './types';
import MediaTreeComponent from './tree';
import IsAdmin from '../isAdmin';
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

const MediaComponent: FC<MediaComponentProps> = ({
  fileLoading,
  folderLoading,
  fileData,
  folderData,
  folderName,
  setFolderName,
  handleCreateFolder,
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
              <MediaTreeComponent
                data={folderData}
                item={folderName}
                setItem={setFolderName}
                handleCreateItem={handleCreateFolder}
              />
            </Loading>
          </Box>
          <Box display="flex" className={classes.dropBox} flexDirection="column">
            <Dropzone files={attachments} setFiles={setAttachments} color="secondary" />
          </Box>
          <IsAdmin>
            <Fab color="primary" className={classes.fab} aria-label="add">
              <AddIcon />
            </Fab>
          </IsAdmin>
        </>
      </Loading>
    </Box>
  );
};

export default MediaComponent;
