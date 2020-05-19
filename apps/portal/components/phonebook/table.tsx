/** @format */

//#region Imports NPM
import React, { FC } from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import { Box, Table, TableBody } from '@material-ui/core';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import InfiniteLoader from 'react-window-infinite-loader';
//#endregion
//#region Imports Local
import { PHONEBOOK_ROW_HEIGHT } from '@lib/constants';
import { PhonebookHeaderContext } from '@lib/context';
import { TableProps } from '@lib/types';
import PhonebookHeader from './header';
import PhonebookRow from './row';
//#endregion

const useStyles = makeStyles(() =>
  createStyles({
    table: {
      display: 'flex',
      flexDirection: 'column',
    },
    tbody: {
      flex: 1,
    },
  }),
);

const itemKey = (index: number, data: any): string => data.items[index].node.id;

const isItemLoaded = (data: any) => (index: number): boolean =>
  data && (!data.pageInfo.hasNextPage || index < data.edges.length);

const PhonebookTable: FC<TableProps> = ({
  hasLoadMore,
  loadMoreItems,
  columns,
  orderBy,
  handleSort,
  largeWidth,
  data,
}) => {
  const classes = useStyles({});

  const itemCount: number = data ? (data.pageInfo.hasNextPage ? data.edges.length + 1 : data.edges.length) : 0;

  const loadMoreItemsFunction = (_: number, __: number): Promise<any> | null => hasLoadMore && loadMoreItems();

  return (
    <Box id="phonebook-wrap" display="flex" flexGrow={1}>
      <Table component="div" className={classes.table}>
        <TableBody component="div" className={classes.tbody}>
          <AutoSizer disableWidth>
            {({ height }) => (
              <InfiniteLoader
                isItemLoaded={isItemLoaded(data)}
                itemCount={itemCount}
                loadMoreItems={loadMoreItemsFunction}
                threshold={50}
              >
                {({ onItemsRendered, ref }) => (
                  <PhonebookHeaderContext.Provider value={{ columns, orderBy, handleSort, largeWidth }}>
                    <List
                      style={{ display: 'flex' }}
                      ref={ref}
                      onItemsRendered={onItemsRendered}
                      width="100%"
                      height={height}
                      itemCount={data ? data.edges.length : 0}
                      itemSize={PHONEBOOK_ROW_HEIGHT}
                      itemKey={itemKey}
                      innerElementType={PhonebookHeader}
                      itemData={{
                        items: data ? data.edges : [],
                        columns,
                        largeWidth,
                      }}
                    >
                      {PhonebookRow}
                    </List>
                  </PhonebookHeaderContext.Provider>
                )}
              </InfiniteLoader>
            )}
          </AutoSizer>
        </TableBody>
      </Table>
    </Box>
  );
};

export default PhonebookTable;
