/** @format */

//#region Imports NPM
import React, { FC } from 'react';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { Box, Fab } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
//#endregion
//#region Imports Local
import { useTranslation } from '@lib/i18n-client';
import { FilesComponentProps, FilesColumn } from '@lib/types';
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

export const filesColumns: FilesColumn[] = [
  { label: 'checked', colspan: 1, hidden: true },
  { label: 'id', colspan: 1, hidden: true },
  { label: 'type', colspan: 1, hidden: true },
  { label: 'name', colspan: 2, hidden: false },
  { label: 'mime', width: 100, colspan: 1, hidden: false },
  // { label: 'creationDate', width: 200, colspan: 1, hidden: false },
  { label: 'lastModified', width: 200, colspan: 1, hidden: false },
  { label: 'size', width: 150, colspan: 1, hidden: false, align: 'right' },
];

const FilesComponent: FC<FilesComponentProps> = ({
  path,
  folderLoading,
  folderData,
  folderRefetch,
  search,
  handleCheckbox,
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
        {folderData && (
          <FilesTableComponent
            path={path}
            data={folderData}
            folderRefetch={folderRefetch}
            search={search}
            filesColumns={filesColumns}
            handleCheckbox={handleCheckbox}
            handleDrop={handleDrop}
            handleFolder={handleFolder}
            handleSearch={handleSearch}
            handleDownload={handleDownload}
            handleDelete={handleDelete}
          />
        )}
      </Loading>
    </Box>
  );
};

export default FilesComponent;
