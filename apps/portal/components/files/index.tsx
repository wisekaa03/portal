/** @format */

//#region Imports NPM
import React, { FC } from 'react';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { Box, Fab } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
//#endregion
//#region Imports Local
import { useTranslation } from '@lib/i18n-client';
import { FilesComponentProps } from '@lib/types';
import Button from '@front/components/ui/button';
import IsAdmin from '@front/components/isAdmin';
import Loading from '@front/components/loading';
import Dropzone from '@front/components/dropzone';
import FilesTreeComponent from './tree';
import FilesDialogComponent from './dialog';
import FilesTableComponent from './table';
//#endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dropBox: {
      padding: theme.spacing(1, 2),
    },
    dropBoxActions: {
      'marginBottom': theme.spacing(),
      '& > button:first-child': {
        marginRight: theme.spacing(),
      },
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
      zIndex: 1,
      position: 'absolute',
      bottom: theme.spacing(2),
      right: 18 + theme.spacing(2),
    },
  }),
);

const FilesComponent: FC<FilesComponentProps> = ({
  folderLoading,
  folderData,
  folderRefetch,
  search,
  handleDrop,
  handleFolder,
  handleSearch,
  handleDownload,
  handleDelete,
  // setFolderName,
  // showDropzone,
  // handleOpenDropzone,
  // handleCloseDropzone,
  // handleEditFolder,
  // openFolderDialog,
  // handleAcceptFolderDialog,
  // handleCloseFolderDialog,
  // folderDialogName,
  // handleFolderDialogName,
  // attachments,
  // setAttachments,
  // handleUploadFile,
}) => {
  const classes = useStyles({});
  const { t } = useTranslation();

  return (
    <Box display="flex" flexDirection="column">
      <Loading activate={folderLoading} noMargin type="linear" variant="indeterminate">
        <>
          {/* <Box display="flex" flexDirection="column" pt={2} px={2} pb={1} overflow="auto">
            <Box display="flex" mb={1}>
              <Box flex={1} display="flex" alignItems="center" justifyContent="flex-end">
                <Button onClick={handleUploadFile}>{t(`media:${current ? 'edit' : 'add'}`)}</Button>
              </Box>
            </Box>
          </Box> */}
          {/* showDropzone && (
            <Box display="flex" className={classes.dropBox} flexDirection="column">
              <Box className={classes.dropBoxActions}>
                <Button disabled={attachments.length === 0}>{t('common:accept')}</Button>
                <Button actionType="cancel" onClick={handleCloseDropzone}>
                  {t('common:cancel')}
                </Button>
              </Box>
              <Dropzone files={attachments} setFiles={setAttachments} color="secondary" />
            </Box>
          )}
          <IsAdmin>
            {!showDropzone && (
              <Fab color="secondary" className={classes.fab} aria-label="add" onClick={handleOpenDropzone}>
                <AddIcon />
              </Fab>
            )}
          </IsAdmin>
          <FilesTableComponent
            data={fileData}
            refetchData={fileRefetch}
            search={search}
            handleSearch={handleSearch}
            handleDownload={handleDownload}
            handleDelete={handleDelete}
            />*/}
          {/*<Box display="flex" className={classes.dropBox} flexDirection="column">*/}
          {/*<FilesTreeComponent data={folderData} />*/}
          {/*<FilesDialogComponent
                  open={openFolderDialog}
                  handleClose={handleCloseFolderDialog}
                  input={folderDialogName}
                  handleInput={handleFolderDialogName}
                  handleAccept={handleAcceptFolderDialog}
                />*/}
          {/*</Box>*/}
          {folderData && (
            <FilesTableComponent
              data={folderData}
              refetchData={folderRefetch}
              search={search}
              handleDrop={handleDrop}
              handleFolder={handleFolder}
              handleSearch={handleSearch}
              handleDownload={handleDownload}
              handleDelete={handleDelete}
            />
          )}
        </>
      </Loading>
    </Box>
  );
};

export default FilesComponent;
