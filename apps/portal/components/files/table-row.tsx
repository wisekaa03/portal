/** @format */

//#region Imports NPM
import React, { FC } from 'react';
import filesize from 'filesize';
import { useDrag } from 'react-dnd';
import { TableRow, TableCell } from '@material-ui/core';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import Checkbox from '@material-ui/core/Checkbox';
//#endregion
//#region Imports Local
import { useTranslation } from '@lib/i18n-client';
import { format } from '@lib/dayjs';
import { FilesTableRow, FilesFolder } from '@lib/types';
import { FilesListType } from './files-list-type';
//#endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    fileIcon: {
      color: theme.palette.secondary.main,
      verticalAlign: 'middle',
    },
    alignRight: {
      textAlign: 'right',
      paddingRight: '10px',
    },
    checkbox: {
      width: '44px',
      maxWidth: '44px',
      minWidth: '44px',
    },
  }),
);

export const FileTableRow: FC<FilesTableRow> = ({ header, current, handleRow }) => {
  const classes = useStyles({});
  const { t, i18n } = useTranslation();

  const [, dragRef] = useDrag({
    item: { type: current.type },
  });

  return (
    <TableRow ref={dragRef} hover tabIndex={-1} onClick={(event) => handleRow(event, current)}>
      <TableCell className={classes.checkbox}>
        <Checkbox inputProps={{ 'aria-label': 'primary checkbox' }} />
      </TableCell>
      <TableCell width={10}>
        <FilesListType type={current.type} className={classes.fileIcon} />
      </TableCell>
      <TableCell>{current.name}</TableCell>
      <TableCell>{current.type === 'FOLDER' ? t('files:folder') : current.mime}</TableCell>
      {/*<TableCell>
        {current.creationDate ? format(current.creationDate, 'DD.MM.YYYY HH:MM') : ''}
      </TableCell>*/}
      <TableCell>{current.lastModified ? format(current.lastModified, 'DD.MM.YYYY HH:MM') : ''}</TableCell>
      <TableCell className={classes.alignRight}>
        {current.type === 'FOLDER' ? '' : filesize(current.size, { locale: i18n.language })}
      </TableCell>
    </TableRow>
  );
};
