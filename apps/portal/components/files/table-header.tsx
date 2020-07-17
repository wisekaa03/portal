/** @format */

//#region Imports NPM
import React, { FC } from 'react';
import { TableRow, TableCell } from '@material-ui/core';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
//#endregion
//#region Imports Local
import { useTranslation } from '@lib/i18n-client';
import { FilesTableHeaderProps } from '@lib/types/files';
//#endregion

const useStyles = makeStyles((theme: Theme) => createStyles({}));

export const FileTableHeader: FC<{ header: FilesTableHeaderProps[] }> = ({ header }) => {
  const classes = useStyles({});
  const { t } = useTranslation();

  return (
    <TableRow>
      {header.map((current) =>
        current.hidden ? null : (
          <TableCell
            colSpan={current.colspan}
            key={current.label}
            align={(current.align ? current.align : 'left') as 'left' | 'right' | 'inherit' | 'center' | 'justify'}
            {...(current.width ? { style: { width: current.width } } : {})}
          >
            {t(`files:table.${current.label}`)}
          </TableCell>
        ),
      )}
    </TableRow>
  );
};
