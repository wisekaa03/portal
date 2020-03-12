/** @format */
// #region Imports NPM
import React, { FC } from 'react';
import { fade, Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import {
  Box,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
} from '@material-ui/core';
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

const HeaderLabels = ['name', 'date', 'type', 'size'];

const FilesTableComponent: FC<FilesTableComponentProps> = ({ data, search, handleSearch }) => {
  const classes = useStyles({});
  const { t } = useTranslation();

  return (
    <div className={classes.root}>
      <Box display="flex" alignItems="center" p={1} className={classes.control}>
        <Search value={search} handleChange={handleSearch} />
        <RefreshButton noAbsolute dense />
      </Box>
      {data.length === 0 ? (
        <Box display="flex" justifyContent="center" mt={2} color="gray">
          <Typography variant="h5">{t('files:notFound')}</Typography>
        </Box>
      ) : (
        <Paper elevation={0}>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {HeaderLabels.map((col) => (
                    <TableCell key={col}>{t(`files:table.${col}`)}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody />
            </Table>
          </TableContainer>
        </Paper>
      )}
    </div>
  );
};

export default FilesTableComponent;
