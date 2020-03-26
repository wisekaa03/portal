/** @format */

// #region Imports NPM
import React, { Component, forwardRef, RefForwardingComponent } from 'react';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { TableRow, TableCell, TableSortLabel } from '@material-ui/core';
// #endregion
// #region Imports Local
import Box from '@lib/box-ref';
import { PhonebookHeaderContext } from '@lib/context';
import { PHONEBOOK_HIDDEN_COLS, PHONEBOOK_ROW_HEIGHT } from '@lib/constants';
import { useTranslation } from '@lib/i18n-client';
import { HeaderPropsRef } from '@lib/types';
import { allColumns } from './settings';
// #endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    row: {
      position: 'sticky',
      top: 0,
      width: 'auto',
      minWidth: '100%',
      boxSizing: 'border-box',
      display: 'flex',
      justifyItems: 'stretch',
      alignContent: 'stretch',
      justifyContent: 'space-between',
      flexWrap: 'nowrap',
      borderBottom: '1px solid rgba(224, 224, 224, 1)',
      background: '#fff',
      zIndex: 2,
      boxShadow: theme.shadows[3],
    },
    cell: {
      flex: '1',
      display: 'flex',
      alignItems: 'center',
      border: 'none',
    },
  }),
);

const PhonebookHeader: RefForwardingComponent<Component, HeaderPropsRef> = ({ children, style }, ref) => {
  const classes = useStyles({});
  const { t } = useTranslation();

  return (
    <PhonebookHeaderContext.Consumer>
      {(context) => (
        <Box ref={ref} flexGrow={1} style={{ height: style.height }}>
          <>
            {context && (
              <TableRow component="div" className={classes.row}>
                {allColumns
                  .filter(({ name }) => context.columns.includes(name) && !PHONEBOOK_HIDDEN_COLS.includes(name))
                  .map((col) => {
                    const { name, defaultStyle, largeStyle } = col;
                    const { largeWidth, handleSort, orderBy } = context;

                    const cellStyle = {
                      height: PHONEBOOK_ROW_HEIGHT,
                      ...(largeWidth ? largeStyle : defaultStyle),
                    };

                    if (name === 'thumbnailPhoto40') {
                      return <TableCell key={name} component="div" className={classes.cell} style={cellStyle} />;
                    }

                    return (
                      <TableCell
                        key={name}
                        component="div"
                        scope="col"
                        className={classes.cell}
                        style={cellStyle}
                        sortDirection={
                          orderBy.field !== name ? false : (orderBy.direction.toLowerCase() as 'asc' | 'desc')
                        }
                      >
                        <TableSortLabel
                          active={orderBy.field === name}
                          direction={orderBy.direction.toLowerCase() as 'desc' | 'asc'}
                          onClick={handleSort(name)}
                        >
                          {t(`phonebook:fields.${name === 'lastName' ? 'fullName' : name}`)}
                        </TableSortLabel>
                      </TableCell>
                    );
                  })}
              </TableRow>
            )}
            {children}
          </>
        </Box>
      )}
    </PhonebookHeaderContext.Consumer>
  );
};

export default forwardRef(PhonebookHeader);
