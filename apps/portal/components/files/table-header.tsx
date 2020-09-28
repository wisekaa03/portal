/** @format */

//#region Imports NPM
import React, { FC } from 'react';
import { TableRow, TableCell, TableSortLabel } from '@material-ui/core';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import Checkbox from '@material-ui/core/Checkbox';
//#endregion
//#region Imports Local
import { useTranslation } from '@lib/i18n-client';
import { FilesHeaderContext } from '@lib/context';
import { FilesTableHeaderProps } from '@lib/types/files';
//#endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    checkbox: {
      width: '44px',
      maxWidth: '44px',
      minWidth: '44px',
      paddingLeft: 0,
      paddingRight: 0,
    },
    cell: {
      borderBottom: '1px solid rgba(224, 224, 224, 1)',
    },
  }),
);

export const FileTableHeader: FC<FilesTableHeaderProps> = ({ header, handleCheckbox }) => {
  const classes = useStyles({});
  const { t } = useTranslation();

  return (
    <FilesHeaderContext.Consumer>
      {(context) => (
        <TableRow>
          <TableCell className={classes.checkbox}>
            <Checkbox onChange={handleCheckbox} inputProps={{ 'aria-label': 'primary checkbox' }} />
          </TableCell>
          {header.map((current) =>
            current.hidden ? null : (
              <TableCell
                colSpan={current.colspan}
                align={(current.align ? current.align : 'left') as 'left' | 'right' | 'inherit' | 'center' | 'justify'}
                key={current.label}
                {...(current.width ? { style: { width: current.width } } : {})}
                // component="div"
                // scope="col"
                className={classes.cell}
                // style={cellStyle}
                // sortDirection={
                //   orderBy.field !== name ? false : (orderBy.direction.toLowerCase() as 'asc' | 'desc')
                // }
              >
                <TableSortLabel
                  active={Boolean(current.label)}
                  // direction={orderBy.direction.toLowerCase() as 'desc' | 'asc'}
                  // onClick={handleSort(current.label)}
                >
                  {t(`files:table.${current.label}`)}
                </TableSortLabel>
              </TableCell>
            ),
          )}
        </TableRow>
      )}
    </FilesHeaderContext.Consumer>
  );
};
