/** @format */

//#region Imports NPM
import React, { FC, useRef } from 'react';
import { TFunction, I18n } from 'next-i18next';
import { Theme, fade, makeStyles, createStyles, withStyles } from '@material-ui/core/styles';
import {
  Box,
  InputBase,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Divider,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  TablePagination,
} from '@material-ui/core';
//#endregion
//#region Imports Local
import { useTranslation } from '@lib/i18n-client';
import type { DocFlowTasksComponentProps, DocFlowTasksTableProps, DocFlowTasksColumn } from '@lib/types/docflow';
import dateFormat from '@lib/date-format';
import BoxWithRef from '@lib/box-ref';
import Search from '@front/components/ui/search';
import Loading from '@front/components/loading';
//#endregion

const DocFlowTasksTable = withStyles((theme) => ({
  container: {
    maxHeight: '100vh',
  },
  footer: {
    width: '100%',
  },
}))(({ t, classes, columns, page, rowsPerPage, handleChangePage, handleChangeRowsPerPage, tasks }: DocFlowTasksTableProps) => (
  <>
    <TableContainer className={classes.container}>
      <Table stickyHeader aria-label="sticky table">
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.id} align={column.align} style={{ minWidth: column.minWidth }}>
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {tasks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((task) => (
            <TableRow hover role="checkbox" tabIndex={-1} key={task.id}>
              {columns.map((column) => {
                const value = column.id.split('.').reduce((acc, elem) => acc[elem], task);
                return (
                  <TableCell key={column.id} align={column.align}>
                    {column.format ? column.format(value) : value}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    <TablePagination
      className={classes.footer}
      rowsPerPageOptions={[10, 25, 50, 100]}
      component="div"
      count={tasks.length}
      rowsPerPage={rowsPerPage}
      page={page}
      onChangePage={handleChangePage}
      onChangeRowsPerPage={handleChangeRowsPerPage}
      labelRowsPerPage={t('docflow:tasks.rowsPerPage')}
      labelDisplayedRows={({ from, to, count }) =>
        `${from}-${to} ${t('docflow:tasks.to')} ${count !== -1 ? count : `${t('docflow:tasks.more')} ${to}`}`
      }
    />
  </>
));

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    notFounds: {
      color: '#949494',
    },
    control: {
      backgroundColor: fade(theme.palette.secondary.main, 0.05),
      borderBottom: '1px solid rgba(224, 224, 224, 1)',
    },
  }),
);

const columns = (t: TFunction, i18n: I18n): DocFlowTasksColumn[] => [
  {
    id: 'name',
    label: t('docflow:tasks.column.name'),
    minWidth: 170,
  },
  {
    id: 'beginDate',
    label: t('docflow:tasks.column.beginDate'),
    minWidth: 20,
    format: (value) => dateFormat(value, i18n),
  },
  {
    id: 'author.name',
    label: t('docflow:tasks.column.author'),
    minWidth: 100,
  },
];

const DocFlowTasksComponent: FC<DocFlowTasksComponentProps> = ({ loading, tasks, status, find, handleSearch, handleStatus }) => {
  const classes = useStyles({});
  const { i18n, t } = useTranslation();
  const tasksBox = useRef(null);

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const maxHeight = tasksBox.current ? `calc(100vh - ${(tasksBox.current as any)?.offsetTop}px)` : '100%';

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" alignItems="center" p={1} className={classes.control}>
        <Search value={find} handleChange={handleSearch} />
      </Box>
      <BoxWithRef
        ref={tasksBox}
        overflow="auto"
        style={{ maxHeight }}
        display="flex"
        flexGrow={1}
        flexWrap="wrap"
        my={2}
        marginTop="0"
        marginBottom="0"
        padding="0"
        alignItems="stretch"
        justifyContent="flex-start"
        alignContent="flex-start"
      >
        <Loading activate={loading} full type="circular" color="secondary" disableShrink size={48}>
          {tasks.length > 0 ? (
            <DocFlowTasksTable
              t={t}
              page={page}
              rowsPerPage={rowsPerPage}
              handleChangePage={handleChangePage}
              handleChangeRowsPerPage={handleChangeRowsPerPage}
              columns={columns(t, i18n)}
              tasks={tasks}
            />
          ) : (
            <Typography className={classes.notFounds} variant="h4">
              {t('docflow:task.notFounds')}
            </Typography>
          )}
        </Loading>
      </BoxWithRef>
    </Box>
  );
};

export default DocFlowTasksComponent;
