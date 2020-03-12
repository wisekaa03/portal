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
import { FilesTableComponentProps, FilesTableHeaderProps } from './types';
import { useTranslation } from '../../lib/i18n-client';
import Loading from '../loading';
import Search from '../ui/search';
import RefreshButton from '../ui/refresh-button';
import { format } from '../../lib/dayjs';
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

const HeaderLabels: FilesTableHeaderProps[] = [
  { label: 'name' },
  { label: 'date', width: 200 },
  { label: 'type', width: 100 },
  { label: 'size', width: 150 },
];

const users: any = [
  { id: '0', name: 'Очень длинное название файла', date: new Date(), type: 'jpg', size: 140 },
  { id: '1', name: 'Очень длинное название файла', date: new Date(), type: 'jpg', size: 140 },
  { id: '2', name: 'Очень длинное название файла', date: new Date(), type: 'jpg', size: 140 },
  { id: '3', name: 'Очень длинное название файла', date: new Date(), type: 'jpg', size: 140 },
  { id: '4', name: 'Очень длинное название файла', date: new Date(), type: 'jpg', size: 140 },
  { id: '5', name: 'Очень длинное название файла', date: new Date(), type: 'jpg', size: 140 },
  { id: '6', name: 'Очень длинное название файла', date: new Date(), type: 'jpg', size: 140 },
  { id: '7', name: 'Очень длинное название файла', date: new Date(), type: 'jpg', size: 140 },
  { id: '8', name: 'Очень длинное название файла', date: new Date(), type: 'jpg', size: 140 },
];

const FilesTableComponent: FC<FilesTableComponentProps> = ({ data, refetchData, search, handleSearch }) => {
  const classes = useStyles({});
  const { t } = useTranslation();

  const filtered = users.filter(({ name }) => name.includes(search));

  return (
    <div className={classes.root}>
      <Box display="flex" alignItems="center" p={1} className={classes.control}>
        <Search value={search} handleChange={handleSearch} />
        <RefreshButton noAbsolute dense onClick={() => refetchData()} />
      </Box>
      {filtered.length === 0 ? (
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
                    <TableCell key={col.label} {...(col.width ? { style: { width: col.width } } : {})}>
                      {t(`files:table.${col.label}`)}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((cur) => (
                  <TableRow key={cur.id} hover tabIndex={-1}>
                    <TableCell>{cur.name}</TableCell>
                    <TableCell>{format(cur.date, 'DD.MM.YYYY')}</TableCell>
                    <TableCell>{cur.type}</TableCell>
                    <TableCell>{cur.size}kb</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </div>
  );
};

export default FilesTableComponent;
