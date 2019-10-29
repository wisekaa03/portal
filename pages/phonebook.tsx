/** @format */

// #region Imports NPM
import React, { useState } from 'react';
import { fade, Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { useQuery } from '@apollo/react-hooks';
import Head from 'next/head';
import {
  Table,
  TableBody,
  TableCell,
  TableSortLabel,
  TableHead,
  TableRow,
  InputBase,
  IconButton,
  Modal,
} from '@material-ui/core';
import { Search as SearchIcon, Settings as SettingsIcon } from '@material-ui/icons';
import { Order, OrderDirection } from 'typeorm-graphql-pagination';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import InfiniteLoader from 'react-window-infinite-loader';
// #endregion
// #region Imports Local
import Page from '../layouts/main';
import { I18nPage, includeDefaultNamespaces, nextI18next, TFunction } from '../lib/i18n-client';
import { Column, ColumnNames } from '../components/phonebook/types';
import { ProfileComponent } from '../components/phonebook/profile';
import { SettingsComponent, allColumns } from '../components/phonebook/settings';
import { appBarHeight } from '../components/app-bar';
import useDebounce from '../lib/debounce';
import { Loading } from '../components/loading';
import { Avatar } from '../components/avatar';
import { PROFILES } from '../lib/queries';
// #endregion

const panelHeight = 48;
const rowHeight = 72;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {},
    panel: {
      height: panelHeight,
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#F7FBFA',
      borderBottom: '1px solid rgba(224, 224, 224, 1)',
    },
    tableWrapper: {
      display: 'block',
      flex: 1,
      height: `calc(100vh - ${appBarHeight}px - ${panelHeight}px)`,
      overflowX: 'auto',
      overflowY: 'hidden',
    },
    table: {
      height: '100%',
      width: '100%',
    },
    tbody: {
      width: '100%',
    },
    row: {
      width: '100%',
      minWidth: '100%',
      boxSizing: 'border-box',
      display: 'flex',
      justifyItems: 'stretch',
      alignContent: 'stretch',
      justifyContent: 'space-between',
      flexWrap: 'nowrap',
    },
    cell: {
      flex: '1',
      display: 'flex',
      alignItems: 'center',
    },
    search: {
      'flexGrow': 1,
      'position': 'relative',
      'borderRadius': theme.shape.borderRadius,
      'backgroundColor': fade(theme.palette.common.white, 0.15),
      '&:hover': {
        backgroundColor: fade(theme.palette.common.white, 0.25),
      },
      'marginRight': theme.spacing(2),
      'marginLeft': 0,
      'width': '100%',
      [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
        width: 'auto',
      },
    },
    searchIcon: {
      width: theme.spacing(7),
      height: '100%',
      position: 'absolute',
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    inputRoot: {
      color: 'inherit',
    },
    inputInput: {
      padding: theme.spacing(1, 1, 1, 7),
      transition: theme.transitions.create('width'),
      width: '100%',
      [theme.breakpoints.up('md')]: {
        width: 200,
      },
    },
    modal: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  }),
);

const defaultColumns: ColumnNames[] = [
  'thumbnailPhoto40',
  'lastName',
  'company',
  'department',
  'title',
  'mobile',
  'telephone',
  'workPhone',
];

// const sortData = (order: Order, orderBy: ColumnNames) => (a: BookProps, b: BookProps) => {
//   const asc: number = order === 'asc' ? 1 : -1;

//   return a[orderBy] > b[orderBy] ? asc * 1 : a[orderBy] < b[orderBy] ? asc * -1 : 0;
// };

const itemKey = (index: number, data: any): string => data.items[index].node.id;

const getGraphQLColumns = (columns: ColumnNames[]): string => {
  let result = columns.join(' ');

  if (columns.includes('lastName')) {
    result += ' firstName middleName';
  }

  if (columns.includes('manager')) {
    result += ' manager { id firstName lastName middleName }';
  }

  return result;
};

const getHeadRows = (
  columns: ColumnNames[],
  orderBy: Order<ColumnNames>,
  handleRequestSort: (column: ColumnNames) => () => void,
  t: TFunction,
  classes: any,
): React.ReactNode | null =>
  allColumns.reduce((result: JSX.Element[], column: Column): JSX.Element[] => {
    if (!columns.includes(column.name) || column.name === 'disabled') return result;

    if (column.name === 'thumbnailPhoto40') {
      return [
        ...result,
        <TableCell
          key={column.name}
          className={classes.cell}
          component="div"
          style={{ minWidth: column.width, height: rowHeight }}
        />,
      ];
    }

    return [
      ...result,
      <TableCell
        key={column.name}
        className={classes.cell}
        component="div"
        scope="col"
        style={{ minWidth: column.width, height: rowHeight }}
        sortDirection={orderBy.field === column.name ? (orderBy.direction.toLowerCase() as 'desc' | 'asc') : false}
      >
        <TableSortLabel
          active={orderBy.field === column.name}
          direction={orderBy.direction.toLowerCase() as 'desc' | 'asc'}
          onClick={handleRequestSort(column.name)}
        >
          {t(`phonebook:fields.${column.name}`)}
        </TableSortLabel>
      </TableCell>,
    ];
  }, []);

const Row: React.FC<ListChildComponentProps> = ({ index, style, data }) => {
  const item = data.items[index].node;
  const { columns, handleProfileId, classes } = data;

  return (
    <TableRow component="div" className={classes.row} hover style={style} onClick={handleProfileId(item.id)}>
      {allColumns.reduce((result: JSX.Element[], column: Column): JSX.Element[] => {
        if (!columns.includes(column.name) || column.name === 'disabled') return result;

        let cellData: React.ReactElement | string | null | undefined = null;

        switch (column.name) {
          case 'thumbnailPhoto40': {
            cellData = <Avatar profile={item} />;
            break;
          }

          case 'lastName': {
            const { firstName, lastName, middleName } = item;
            cellData = `${lastName || ''} ${firstName || ''} ${middleName || ''}`;
            break;
          }

          case 'mobile':
          case 'telephone':
          case 'workPhone':
          case 'company':
          case 'department':
          case 'title': {
            cellData = item[column.name];
            break;
          }

          default: {
            break;
          }
        }

        return [
          ...result,
          <TableCell
            key={column.name}
            className={classes.cell}
            style={{ minWidth: column.width, height: rowHeight }}
            component="div"
            variant="body"
          >
            {cellData}
          </TableCell>,
        ];
      }, [])}
    </TableRow>
  );
};

const PhoneBook: I18nPage = ({ t, ...rest }): React.ReactElement => {
  const classes = useStyles({});

  const [orderBy, setOrderBy] = useState<Order<ColumnNames>>({
    direction: OrderDirection.ASC,
    field: 'lastName',
  });
  const [columns, setColumns] = useState<ColumnNames[]>(defaultColumns);

  const [profileId, setProfileId] = useState<string | boolean>(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);

  const [_search, setSearch] = useState<string>('');
  const search = useDebounce(_search, 1000);

  const { loading, error, data, fetchMore } = useQuery(PROFILES(getGraphQLColumns(columns)), {
    variables: {
      orderBy,
      first: search.length > 3 ? 100 : 50,
      after: '',
      search: search.length > 3 ? search : '',
    },
  });

  const itemCount = data
    ? data.profiles.pageInfo.hasNextPage
      ? data.profiles.edges.length + 1
      : data.profiles.edges.length
    : 0;
  const isItemLoaded = (index: any): boolean =>
    data && (!data.profiles.pageInfo.hasNextPage || index < data.profiles.edges.length);
  const fetchFunction = (): any =>
    fetchMore({
      query: PROFILES(getGraphQLColumns(columns)),
      variables: {
        orderBy,
        after: data.profiles.pageInfo.endCursor,
        first: search.length > 3 ? 100 : 50,
        search: search.length > 3 ? search : '',
      },
      updateQuery: (previousResult, { fetchMoreResult }) => {
        const { pageInfo, edges, totalCount, __typename } = fetchMoreResult.profiles;

        if (edges.length === 0) return previousResult;

        return {
          profiles: {
            __typename,
            totalCount,
            edges: [...previousResult.profiles.edges, ...edges],
            pageInfo,
          },
        };
      },
    });

  const loadMoreItems = (_: number, __: number): any => !loading && fetchFunction();

  const handleRequestSort = (column: ColumnNames) => (): void => {
    const isAsc = orderBy.field === column && orderBy.direction === OrderDirection.ASC;
    setOrderBy({
      direction: isAsc ? OrderDirection.DESC : OrderDirection.ASC,
      field: column,
    });
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setSearch(event.target.value);
  };

  const handleProfileId = (id: string | undefined) => (): void => {
    setProfileId(id || false);
  };

  const handleProfileClose = (): void => {
    setProfileId(false);
  };

  const handleSettingsOpen = (): void => {
    setSettingsOpen(true);
  };

  const handleSettingsClose = (): void => {
    setSettingsOpen(false);
  };

  return (
    <>
      <Head>{t('phonebook:title')}</Head>
      <Page {...rest}>
        <div className={classes.root}>
          {loading && <Loading noMargin type="linear" variant="indeterminate" />}
          <div className={classes.panel}>
            <div className={classes.search}>
              <div className={classes.searchIcon}>
                <SearchIcon />
              </div>
              <InputBase
                placeholder={t('phonebook:search')}
                value={_search}
                onChange={handleSearch}
                fullWidth
                classes={{
                  root: classes.inputRoot,
                  input: classes.inputInput,
                }}
                inputProps={{ 'aria-label': 'search' }}
              />
            </div>
            <IconButton onClick={handleSettingsOpen}>
              <SettingsIcon />
            </IconButton>
          </div>
          <div id="phonebook-wrap" className={classes.tableWrapper}>
            <Table stickyHeader component="div" className={classes.table}>
              <TableHead component="div">
                <TableRow component="div" className={classes.row}>
                  {getHeadRows(columns, orderBy, handleRequestSort, t, classes)}
                </TableRow>
              </TableHead>
              <TableBody component="div" className={classes.tbody}>
                <AutoSizer disableWidth>
                  {({ height }) => (
                    <InfiniteLoader isItemLoaded={isItemLoaded} itemCount={itemCount} loadMoreItems={loadMoreItems}>
                      {({ onItemsRendered, ref }) => (
                        <List
                          ref={ref}
                          onItemsRendered={onItemsRendered}
                          width="100%"
                          height={height}
                          itemCount={data ? data.profiles.edges.length : 0}
                          itemSize={rowHeight}
                          itemKey={itemKey}
                          itemData={{
                            classes,
                            items: data ? data.profiles.edges : [],
                            columns,
                            handleProfileId,
                          }}
                        >
                          {Row}
                        </List>
                      )}
                    </InfiniteLoader>
                  )}
                </AutoSizer>
              </TableBody>
            </Table>
          </div>
        </div>
      </Page>
      <Modal open={Boolean(profileId)} onClose={handleProfileClose} className={classes.modal}>
        <div>
          <ProfileComponent profileId={profileId} handleClose={handleProfileClose} />
        </div>
      </Modal>
      <Modal open={settingsOpen} onClose={handleSettingsClose} className={classes.modal}>
        <div>
          <SettingsComponent columns={columns} changeColumn={setColumns} handleClose={handleSettingsClose} />
        </div>
      </Modal>
    </>
  );
};

PhoneBook.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['phonebook']),
});

export default nextI18next.withTranslation('phonebook')(PhoneBook);
