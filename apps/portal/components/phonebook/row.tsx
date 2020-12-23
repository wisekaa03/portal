/** @format */

//#region Imports NPM
import React, { FC, ReactElement } from 'react';
import Link from 'next/link';
import { ListChildComponentProps } from 'react-window';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import { TableRow, TableCell } from '@material-ui/core';
import { red, blueGrey } from '@material-ui/core/colors';
import clsx from 'clsx';
//#endregion
//#region Imports Local
import { PHONEBOOK_HIDDEN_COLS, PHONEBOOK_ROW_HEIGHT } from '@lib/constants';
import Avatar from '@front/components/ui/avatar';
import { allColumns } from './settings';
//#endregion

const useStyles = makeStyles(() =>
  createStyles({
    row: {
      width: 'auto',
      minWidth: '100%',
      boxSizing: 'border-box',
      display: 'flex',
      justifyItems: 'stretch',
      alignContent: 'stretch',
      justifyContent: 'space-between',
      flexWrap: 'nowrap',
      borderBottom: '1px solid rgba(224, 224, 224, 1)',
    },
    cell: {
      flex: '1',
      display: 'flex',
      alignItems: 'center',
      border: 'none',
    },
    nowrap: {
      flexWrap: 'nowrap',
      whiteSpace: 'nowrap',
      flexFlow: 'nowrap',
    },
    disabled: {
      color: red[600],
    },
    notShowing: {
      color: blueGrey[200],
    },
  }),
);

// eslint-disable-next-line no-unused-vars
const PhonebookRow: FC<ListChildComponentProps> = ({ index, style: { width, top, ...rest }, data }) => {
  const classes = useStyles({});
  const { columns, largeWidth } = data;
  const cell = data.items[index].node;

  return (
    <TableRow
      component="div"
      className={classes.row}
      style={{ ...rest, top: `${Number.parseFloat(top as string) + PHONEBOOK_ROW_HEIGHT}px` }}
      hover
    >
      {allColumns
        .filter(({ name }) => columns.includes(name) && !PHONEBOOK_HIDDEN_COLS.includes(name))
        .map((column) => {
          const { name, defaultStyle, largeStyle } = column;

          const cellStyle = {
            height: PHONEBOOK_ROW_HEIGHT,
            ...(largeWidth ? largeStyle : defaultStyle),
          };

          let cellData: ReactElement | string = '';
          let cellNowrap = false;

          switch (name) {
            case 'thumbnailPhoto40': {
              cellData = (
                <Link href={{ pathname: '/phonebook', query: { id: cell.id } }} as={`/phonebook/${cell.id}`}>
                  <Avatar profile={cell} alt="photo" />
                </Link>
              );
              break;
            }

            case 'lastName':
              cellData = cell.fullName;
              break;

            case 'manager': {
              if (!cell.manager) {
                break;
              }

              cellData = cell.manager.fullName;
              break;
            }

            case 'loginDomain': {
              cellNowrap = true;
              cellData = cell[name];
              break;
            }

            case 'nameEng':
            case 'username':
            case 'company':
            case 'companyEng':
            case 'management':
            case 'managementEng':
            case 'department':
            case 'departmentEng':
            case 'division':
            case 'divisionEng':
            case 'title':
            case 'titleEng':
            case 'room':
            case 'telephone':
            case 'fax':
            case 'mobile':
            case 'workPhone':
            case 'email':
            case 'country':
            case 'region':
            case 'city':
            case 'street': {
              cellData = cell[name];
              break;
            }

            default: {
              break;
            }
          }

          return (
            <TableCell
              key={name}
              component="div"
              variant="body"
              className={clsx(classes.cell, {
                [classes.nowrap]: cellNowrap,
                [classes.disabled]: cell.disabled && name === 'lastName',
                [classes.notShowing]: cell.notShowing && name === 'lastName',
              })}
              style={cellStyle}
            >
              {cellData}
            </TableCell>
          );
        })}
    </TableRow>
  );
};

export default PhonebookRow;
