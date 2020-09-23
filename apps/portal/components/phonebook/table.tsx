/** @format */

//#region Imports NPM
import React, { FC, Key } from 'react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import InfiniteLoader from 'react-window-infinite-loader';
import { ApolloQueryResult } from '@apollo/client';
import { Connection, Edge } from 'typeorm-graphql-pagination';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import { Box, Table, TableBody } from '@material-ui/core';
//#endregion
//#region Imports Local
import { PHONEBOOK_ROW_HEIGHT } from '@lib/constants';
import { PhonebookHeaderContext } from '@lib/context';
import type { PhonebookTableProps, Profile, Data } from '@lib/types';
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

export interface ListItemProfile {
  items: Edge<Profile>;
  columns: Array<string>;
  largeWidth: boolean;
}

const itemKey = (index: number, data: ListItemProfile): Key => data.items[index].node.id;

const isItemLoaded = (data: Connection<Profile>) => (index: number): boolean =>
  data && (!data.pageInfo.hasNextPage || index < data.edges.length);

const PhonebookTable: FC<PhonebookTableProps> = ({ hasLoadMore, loadMoreItems, columns, orderBy, handleSort, largeWidth, data }) => {
  const classes = useStyles({});

  const itemCount: number = data.pageInfo.hasNextPage ? data.edges.length + 1 : data.edges.length;

  const loadMoreItemsFunction = async (
    _: number,
    __: number,
  ): Promise<ApolloQueryResult<Data<'profiles', Connection<Profile>>> | undefined> => (hasLoadMore ? loadMoreItems() : undefined);

  return (
    <Box id="phonebook-wrap" display="flex" flexGrow={1}>
      <Table component="div" className={classes.table}>
        <TableBody component="div" className={classes.tbody}>
          <AutoSizer disableWidth>
            {({ height }) => (
              <InfiniteLoader isItemLoaded={isItemLoaded(data)} itemCount={itemCount} loadMoreItems={loadMoreItemsFunction} threshold={50}>
                {({ onItemsRendered, ref }) => (
                  <PhonebookHeaderContext.Provider value={{ columns, orderBy, handleSort, largeWidth }}>
                    <List
                      style={{ display: 'flex' }}
                      ref={ref}
                      onItemsRendered={onItemsRendered}
                      width="100%"
                      height={height}
                      itemCount={data.edges.length}
                      itemSize={PHONEBOOK_ROW_HEIGHT}
                      itemKey={itemKey}
                      innerElementType={PhonebookHeader}
                      itemData={{
                        items: data.edges,
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
