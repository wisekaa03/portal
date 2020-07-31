/** @format */
//#region Imports NPM
import React, { FC, useState } from 'react';
import clsx from 'clsx';
import filesize from 'filesize';
import AutoSizer from 'react-virtualized-auto-sizer';
import { fade, darken, Theme, makeStyles, createStyles, useTheme } from '@material-ui/core/styles';
import {
  Box,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
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
import DeleteIcon from '@material-ui/icons/DeleteRounded';
//#endregion
//#region Imports Local
import { useTranslation } from '@lib/i18n-client';
import { format } from '@lib/dayjs';
import { FilesTableProps, Folder, FilesFolderChk } from '@lib/types';
import { FilesListType } from './files-list-type';
import { FileTableRow } from './table-row';
import { FileTableHeader } from './table-header';
import { FilesBreadcrumbs } from './breadcrumbs';
//#endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      padding: `0 ${theme.spacing()} ${theme.spacing()} ${theme.spacing()}`,
    },
    icon: {
      color: theme.palette.secondary.main,
    },
    fileIcon: {
      color: theme.palette.secondary.main,
      verticalAlign: 'middle',
    },
    absolute: {
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
    dropzone: {
      position: 'absolute',
      bottom: 0,
      width: '100%',
    },
    breadcrumbs: {
      fontSize: '1.2em',
      borderBottom: '1px solid rgba(224, 224, 224, 1)',
    },
    breadcrumbsItem: {
      'display': 'flex',
      'border': 0,
      'textDecoration': 'none',
      'color': '#6AA7C8',
      '&:hover': {
        textDecoration: 'none',
        color: darken('#6AA7C8', 0.2),
      },
    },
    breadcrumbsLast: {
      width: '26px',
      height: '26px',
      minHeight: '26px',
    },
  }),
);

const FilesTableComponent: FC<FilesTableProps> = ({
  path,
  data,
  search,
  filesColumns,
  handleCheckbox,
  handleFolder,
  handleDownload,
  handleDelete,
  handleUpload,
  handleUrl,
}) => {
  const classes = useStyles({});
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const [open, setOpen] = useState<boolean>(false);
  const [detail, setDetail] = useState<FilesFolderChk | null>(null);

  const handleClose = async (): Promise<void> => {
    setOpen(false);
    setDetail(null);
  };

  const handleRow = (event: React.MouseEvent<HTMLTableCellElement, MouseEvent>, element: FilesFolderChk): void => {
    if (element.type === Folder.FILE) {
      setDetail(element);
      setOpen(true);
    } else {
      handleFolder(element);
    }
  };

  const filtered = data.filter(({ name, size }) => name.includes(search) || size.toString().includes(search));

  return (
    <div className={classes.root}>
      <Box display="flex" className={classes.breadcrumbs} p={1}>
        <FilesBreadcrumbs
          path={path}
          handleFolder={handleFolder}
          handleUrl={handleUrl}
          handleUpload={handleUpload}
          handleDelete={handleDelete}
        />
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
                <TableContainer style={{ height: height - 79 - theme.spacing(2) }}>
                  <Table stickyHeader>
                    <TableHead>
                      <FileTableHeader handleCheckbox={handleCheckbox(filtered)} header={filesColumns} />
                    </TableHead>
                    <TableBody>
                      {filtered.map((current: FilesFolderChk, index) => (
                        <FileTableRow
                          key={current.id}
                          header={filesColumns}
                          current={current}
                          index={index}
                          handleCheckbox={handleCheckbox}
                          handleRow={handleRow}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {/* <Dropzone className={classes.dropzone} setFiles={setFiles}
                    files={files} mode="compact" border="top" /> */}
              </Paper>
            )}
          </AutoSizer>
          {detail && (
            <Dialog open={open} onClose={handleClose} classes={{ paper: classes.paper }}>
              <DialogContent>
                <Box display="grid" gridGap={16}>
                  <Box display="flex" justifyContent="center">
                    <FilesListType
                      current={detail}
                      className={clsx(classes.fileIcon, classes.absolute)}
                      fontSize="large"
                    />
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
