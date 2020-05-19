/** @format */
//#region Imports NPM
import React, { FC, useState } from 'react';
import { fade, Theme, makeStyles, createStyles, useTheme } from '@material-ui/core/styles';
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
  Dialog,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  ListItem,
  ListItemText,
  List,
} from '@material-ui/core';
import GetAppIcon from '@material-ui/icons/GetAppRounded';
import EditIcon from '@material-ui/icons/EditRounded';
import DeleteIcon from '@material-ui/icons/DeleteRounded';
import DescriptionIcon from '@material-ui/icons/DescriptionRounded';
import AutoSizer from 'react-virtualized-auto-sizer';
//#endregion
//#region Imports Local
import { useTranslation } from '@lib/i18n-client';
import { format } from '@lib/dayjs';
import { FilesTableComponentProps, FilesTableHeaderProps } from '@lib/types';
import Loading from '@front/components/loading';
import Search from '@front/components/ui/search';
import RefreshButton from '@front/components/ui/refresh-button';
//#endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      padding: theme.spacing(),
    },
    control: {
      backgroundColor: fade(theme.palette.secondary.main, 0.05),
    },
    icon: {
      color: theme.palette.secondary.main,
    },
    fileIcon: {
      color: theme.palette.secondary.main,
      position: 'absolute',
      top: theme.spacing(2),
      left: theme.spacing(2),
    },
    editIcon: {
      position: 'absolute',
      top: theme.spacing(2),
      right: theme.spacing(2),
    },
    paper: {
      minWidth: 500,
    },
    list: {
      'padding': 0,
      '& > li': {
        display: 'grid',
        gridTemplateColumns: '1fr 3fr',
        minHeight: theme.spacing(5),
      },
    },
  }),
);

const HeaderLabels: FilesTableHeaderProps[] = [
  { label: 'name' },
  { label: 'date', width: 200 },
  { label: 'type', width: 100 },
  { label: 'size', width: 150 },
];

const fakeData: any = [
  { id: '0', name: 'Очень длинное название файла 1', date: new Date(), type: 'jpg', size: 140 },
  { id: '1', name: 'Очень длинное название файла 2', date: new Date(), type: 'doc', size: 140 },
  { id: '2', name: 'Очень длинное название файла 3', date: new Date(), type: 'png', size: 1140 },
  { id: '3', name: 'Очень длинное название файла 4', date: new Date(), type: 'jpg', size: 140 },
  { id: '4', name: 'Очень длинное название файла 5', date: new Date(), type: 'jpg', size: 140 },
  { id: '5', name: 'Очень длинное название файла 6', date: new Date(), type: 'doc', size: 140 },
  { id: '6', name: 'Очень длинное название файла 7', date: new Date(), type: 'jpg', size: 2140 },
  { id: '7', name: 'Очень длинное название файла 8', date: new Date(), type: 'png', size: 140 },
  { id: '8', name: 'Очень длинное название файла 9', date: new Date(), type: 'jpg', size: 140 },
  { id: '9', name: 'Очень длинное название файла 10', date: new Date(), type: 'jpg', size: 3140 },
  { id: '10', name: 'Очень длинное название файла 11', date: new Date(), type: 'jpg', size: 140 },
  { id: '11', name: 'Очень длинное название файла 12', date: new Date(), type: 'jpg', size: 140 },
  { id: '12', name: 'Очень длинное название файла 13', date: new Date(), type: 'png', size: 4140 },
  { id: '13', name: 'Очень длинное название файла 14', date: new Date(), type: 'doc', size: 140 },
  { id: '14', name: 'Очень длинное название файла 15', date: new Date(), type: 'jpg', size: 140 },
  { id: '15', name: 'Очень длинное название файла 16', date: new Date(), type: 'png', size: 5140 },
  { id: '16', name: 'Очень длинное название файла 17', date: new Date(), type: 'jpg', size: 140 },
  { id: '17', name: 'Очень длинное название файла 18', date: new Date(), type: 'jpg', size: 140 },
  { id: '18', name: 'Очень длинное название файла 19', date: new Date(), type: 'png', size: 6140 },
  { id: '19', name: 'Очень длинное название файла 20', date: new Date(), type: 'jpg', size: 140 },
  { id: '20', name: 'Очень длинное название файла 21', date: new Date(), type: 'jpg', size: 140 },
  { id: '21', name: 'Очень длинное название файла 22', date: new Date(), type: 'png', size: 140 },
  { id: '22', name: 'Очень длинное название файла 23', date: new Date(), type: 'jpg', size: 140 },
  { id: '23', name: 'Очень длинное название файла 24', date: new Date(), type: 'jpg', size: 140 },
  { id: '24', name: 'Очень длинное название файла 25', date: new Date(), type: 'jpg', size: 140 },
  { id: '25', name: 'Очень длинное название файла 26', date: new Date(), type: 'doc', size: 140 },
  { id: '26', name: 'Очень длинное название файла 27', date: new Date(), type: 'jpg', size: 140 },
  { id: '27', name: 'Очень длинное название файла 28', date: new Date(), type: 'jpg', size: 140 },
  { id: '28', name: 'Очень длинное название файла 29', date: new Date(), type: 'jpg', size: 140 },
  { id: '29', name: 'Очень длинное название файла 30', date: new Date(), type: 'jpg', size: 140 },
  { id: '30', name: 'Очень длинное название файла 31', date: new Date(), type: 'jpg', size: 140 },
];

const FilesTableComponent: FC<FilesTableComponentProps> = ({
  data,
  refetchData,
  search,
  handleSearch,
  handleDownload,
  handleDelete,
}) => {
  const classes = useStyles({});
  const { t } = useTranslation();
  const theme = useTheme();
  const [open, setOpen] = useState<boolean>(false);
  const [detail, setDetail] = useState<any>({});

  const handleClose = (): void => {
    setOpen(false);
  };

  const handleRow = (element: any): void => {
    setDetail(element);
    setOpen(true);
  };

  const filtered = fakeData.filter(({ name, size }) => name.includes(search) || size.toString().includes(search));

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
        <>
          <AutoSizer disableWidth>
            {({ height }) => (
              <Paper elevation={0}>
                {/* TODO: как я понял не учтены внутренние отступы, а так же высота control бара */}
                <TableContainer style={{ height: height - 35 - theme.spacing(2) }}>
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
                        <TableRow key={cur.id} hover tabIndex={-1} onClick={() => handleRow(cur)}>
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
          </AutoSizer>
          <Dialog open={open} onClose={handleClose} classes={{ paper: classes.paper }}>
            <DialogContent>
              <Box display="grid" gridGap={16}>
                <Box display="flex" justifyContent="center">
                  <DescriptionIcon className={classes.fileIcon} fontSize="large" />
                  <Typography variant="subtitle1">{detail.name}</Typography>
                  <Tooltip title={t('files:edit')}>
                    <IconButton className={classes.editIcon} size="small">
                      <EditIcon className={classes.icon} />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box>
                  <Paper>
                    <List className={classes.list}>
                      <ListItem divider>
                        <ListItemText primary={t('files:table.date')} />
                        <ListItemText primary={format(detail.date, 'DD.MM.YYYY')} />
                      </ListItem>
                      <ListItem divider>
                        <ListItemText primary={t('files:table.type')} />
                        <ListItemText primary={detail.type} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary={t('files:table.size')} />
                        <ListItemText primary={`${detail.size} kb`} />
                      </ListItem>
                    </List>
                  </Paper>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Tooltip title={t('files:download')}>
                <IconButton onClick={handleDownload}>
                  <GetAppIcon className={classes.icon} />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('files:delete')}>
                <IconButton onClick={handleDelete}>
                  <DeleteIcon className={classes.icon} />
                </IconButton>
              </Tooltip>
            </DialogActions>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default FilesTableComponent;
