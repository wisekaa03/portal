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
  SvgIconProps,
} from '@material-ui/core';
import GetAppIcon from '@material-ui/icons/GetAppRounded';
import EditIcon from '@material-ui/icons/EditRounded';
import DeleteIcon from '@material-ui/icons/DeleteRounded';
import AutoSizer from 'react-virtualized-auto-sizer';
import FolderIcon from '@material-ui/icons/Folder';
import FileIcon from '@material-ui/icons/DescriptionRounded';
import filesize from 'filesize';
//#endregion
//#region Imports Local
import { useTranslation } from '@lib/i18n-client';
import { format } from '@lib/dayjs';
import {
  FilesTableComponentProps,
  FilesTableHeaderProps,
  Folder,
  FilesFolder,
  FilesFolderListHeaderLabels,
} from '@lib/types';
import Loading from '@front/components/loading';
import Search from '@front/components/ui/search';
import RefreshButton from '@front/components/ui/refresh-button';
//#endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      padding: `0 ${theme.spacing()} ${theme.spacing()} ${theme.spacing()}`,
    },
    control: {
      backgroundColor: fade(theme.palette.secondary.main, 0.05),
      borderBottom: '1px solid rgba(224, 224, 224, 1)',
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
    paddingRight: {
      paddingRight: '10px',
    },
    alignRight: {
      textAlign: 'right',
      paddingRight: '10px',
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

interface FilesListType extends SvgIconProps {
  type: Folder;
}

const FilesListType: FC<FilesListType> = ({ type, ...rest }) =>
  type === 'FOLDER' ? <FolderIcon {...rest} /> : <FileIcon {...rest} />;

const FilesTableComponent: FC<FilesTableComponentProps> = ({
  data,
  refetchData,
  search,
  handleSearch,
  handleDownload,
  handleDelete,
}) => {
  const classes = useStyles({});
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const [open, setOpen] = useState<boolean>(false);
  const [detail, setDetail] = useState<FilesFolder | null>(null);

  const handleClose = async (): Promise<void> => {
    setOpen(false);
    setDetail(null);
  };

  const handleRow = (element: FilesFolder): void => {
    setDetail(element);
    setOpen(true);
  };

  const filtered = data.filter(({ name, size }) => name.includes(search) || size.toString().includes(search));

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
                        {FilesFolderListHeaderLabels.map((col) =>
                          col.hidden ? null : (
                            <TableCell
                              colSpan={col.colspan}
                              key={col.label}
                              align={
                                (col.align ? col.align : 'left') as 'left' | 'right' | 'inherit' | 'center' | 'justify'
                              }
                              {...(col.width ? { style: { width: col.width } } : {})}
                            >
                              {t(`files:table.${col.label}`)}
                            </TableCell>
                          ),
                        )}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filtered.map((current: FilesFolder) => (
                        <TableRow key={current.id} hover tabIndex={-1} onClick={() => handleRow(current)}>
                          <TableCell width={10}>
                            <FilesListType type={current.type} />
                          </TableCell>
                          <TableCell>{current.name}</TableCell>
                          <TableCell>{current.type === 'FOLDER' ? t('files:folder') : current.mime}</TableCell>
                          {/*<TableCell>
                            {current.creationDate ? format(current.creationDate, 'DD.MM.YYYY HH:MM') : ''}
                          </TableCell>*/}
                          <TableCell>
                            {current.lastModified ? format(current.lastModified, 'DD.MM.YYYY HH:MM') : ''}
                          </TableCell>
                          <TableCell className={classes.alignRight}>
                            {current.type === 'FOLDER' ? '' : filesize(current.size, { locale: i18n.language })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}
          </AutoSizer>
          {detail && (
            <Dialog open={open} onClose={handleClose} classes={{ paper: classes.paper }}>
              <DialogContent>
                <Box display="grid" gridGap={16}>
                  <Box display="flex" justifyContent="center">
                    <FilesListType type={detail.type} className={classes.fileIcon} fontSize="large" />
                    <Typography variant="subtitle1">{detail.name}</Typography>
                    {/*<Tooltip title={t('files:edit') || ''}>
                      <IconButton className={classes.editIcon} size="small">
                        <EditIcon className={classes.icon} />
                      </IconButton>
                    </Tooltip>*/}
                  </Box>
                  <Box>
                    <Paper>
                      <List className={classes.list}>
                        <ListItem divider>
                          <ListItemText className={classes.paddingRight} primary={t('files:table.lastModified')} />
                          <ListItemText primary={format(detail.lastModified, 'DD.MM.YYYY HH:MM')} />
                        </ListItem>
                        {detail.mime && (
                          <ListItem divider>
                            <ListItemText className={classes.paddingRight} primary={t('files:table.mime')} />
                            <ListItemText primary={detail.mime} />
                          </ListItem>
                        )}
                        {detail.type === 'FILE' && (
                          <ListItem>
                            <ListItemText className={classes.paddingRight} primary={t('files:table.size')} />
                            <ListItemText primary={filesize(detail.size, { locale: i18n.language })} />
                          </ListItem>
                        )}
                      </List>
                    </Paper>
                  </Box>
                </Box>
              </DialogContent>
              <DialogActions>
                {detail.type === 'FILE' && (
                  <Tooltip title={t('files:download') || ''}>
                    <IconButton onClick={handleDownload(detail)}>
                      <GetAppIcon className={classes.icon} />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title={t('files:delete') || ''}>
                  <IconButton onClick={handleDelete(detail)}>
                    <DeleteIcon className={classes.icon} />
                  </IconButton>
                </Tooltip>
              </DialogActions>
            </Dialog>
          )}
        </>
      )}
    </div>
  );
};

export default FilesTableComponent;
