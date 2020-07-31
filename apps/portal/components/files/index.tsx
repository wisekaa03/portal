/** @format */

//#region Imports NPM
import React, { FC } from 'react';
import { fade, Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';
//#endregion
//#region Imports Local
import type { FilesComponentProps, FilesColumn } from '@lib/types';
import Loading from '@front/components/loading';
import Search from '@front/components/ui/search';
import RefreshButton from '@front/components/ui/refresh-button';
import FilesTableComponent from './table';
//#endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    control: {
      backgroundColor: fade(theme.palette.secondary.main, 0.05),
      borderBottom: '1px solid rgba(224, 224, 224, 1)',
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
  handleUpload,
  handleDelete,
  handleUrl,
}) => {
  const classes = useStyles({});

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" alignItems="center" p={1} className={classes.control}>
        <Search value={search} handleChange={handleSearch} />
        <RefreshButton noAbsolute dense onClick={() => folderRefetch && folderRefetch()} />
      </Box>
      <Loading activate={folderLoading} noMargin type="linear" variant="indeterminate">
        {folderData && (
          <FilesTableComponent
            path={path}
            data={folderData}
            search={search}
            filesColumns={filesColumns}
            handleCheckbox={handleCheckbox}
            handleDrop={handleDrop}
            handleFolder={handleFolder}
            handleSearch={handleSearch}
            handleDownload={handleDownload}
            handleUpload={handleUpload}
            handleDelete={handleDelete}
            handleUrl={handleUrl}
          />
        )}
      </Loading>
    </Box>
  );
};

export default FilesComponent;
