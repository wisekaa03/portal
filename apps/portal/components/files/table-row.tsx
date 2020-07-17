/** @format */

//#region Imports NPM
import React, { FC } from 'react';
import filesize from 'filesize';
import { TableRow, TableCell } from '@material-ui/core';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
//#endregion
//#region Imports Local
import { useTranslation } from '@lib/i18n-client';
import { format } from '@lib/dayjs';
import { FilesTableRow, FilesFolder } from '@lib/types';
import { FilesListType } from './files-list-type';
import { useDrag } from 'react-dnd';
//#endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    fileIcon: {
      color: theme.palette.secondary.main,
    },
    alignRight: {
      textAlign: 'right',
      paddingRight: '10px',
    },
  }),
);

export const FileTableRow: FC<FilesTableRow> = ({ header, current, handleRow }) => {
  const classes = useStyles({});
  const { t, i18n } = useTranslation();

  const [{ isDragging }, drag] = useDrag({
    item: { type: current.type },
  });

  return (
    <TableRow ref={drag} hover tabIndex={-1} onClick={() => handleRow(current)}>
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
