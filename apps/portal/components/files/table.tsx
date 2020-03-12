/** @format */
// #region Imports NPM
import React, { FC } from 'react';
import { fade, Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { Box, Fab } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
// #endregion
// #region Imports Local
import { FilesTableComponentProps } from './types';
import { useTranslation } from '../../lib/i18n-client';
import Loading from '../loading';
import Search from '../ui/search';
import RefreshButton from '../ui/refresh-button';
// #endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      padding: theme.spacing(),
    },
    control: {
      backgroundColor: fade(theme.palette.secondary.main, 0.05),
    },
  }),
);

const FilesTableComponent: FC<FilesTableComponentProps> = ({ search, handleSearch }) => {
  const classes = useStyles({});
  const { t } = useTranslation();

  return (
    <div className={classes.root}>
      <Box display="flex" alignItems="center" p={1} className={classes.control}>
        <Search value={search} handleChange={handleSearch} />
        <RefreshButton noAbsolute dense />
      </Box>
    </div>
  );
};

export default FilesTableComponent;
