/** @format */

// #region Imports NPM
import React, { useState, useEffect } from 'react';
import { fade, Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { useQuery } from '@apollo/react-hooks';
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
import clsx from 'clsx';
import { Order, OrderDirection } from 'typeorm-graphql-pagination';
// #endregion
// #region Imports Local
import Head from 'next/head';
import Page from '../layouts/main';
import { I18nPage, includeDefaultNamespaces, nextI18next } from '../lib/i18n-client';
import { ColumnNames } from '../components/phonebook/types';
import { ProfileComponent } from '../components/phonebook/profile';
import { SettingsComponent, allColumns } from '../components/phonebook/settings';
import { appBarHeight } from '../components/app-bar';
import useDebounce from '../lib/debounce';
import { Profile } from '../server/profile/models/profile.dto';
import { Loading } from '../components/loading';
import { Avatar } from '../components/avatar';
import { PROFILES } from '../lib/queries';
// #endregion

const panelHeight = 48;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {},
    panel: {
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#F7FBFA',
      borderBottom: '1px solid rgba(224, 224, 224, 1)',
    },
    panelLoading: {
      height: panelHeight - 4,
      paddingBottom: 4,
    },
    panelNoLoading: {
      height: panelHeight,
    },
    table: { height: `calc(100vh - ${appBarHeight}px - ${panelHeight}px)`, overflow: 'auto' },
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

const getColumns = (columns: ColumnNames[]): string => {
  let result = columns.join(' ');

  if (columns.includes('lastName')) {
    result += ' firstName middleName';
  }

  if (columns.includes('manager')) {
    result += ' manager { id firstName lastName middleName }';
  }

  return result;
};

const getRows = (
  data: any,
  columns: ColumnNames[],
  onClick: (id: string | undefined) => () => void,
): React.ReactNode | null => {
  if (!data || !data.profiles) return null;

  return data.profiles.edges.map((item: { node: Profile }) => (
    <TableRow key={item.node.id} hover onClick={onClick(item.node.id)}>
      {allColumns.reduce((result: JSX.Element[], column: ColumnNames): JSX.Element[] => {
        if (!columns.includes(column) || column === 'disabled') return result;

        let cellData: React.ReactElement | string | null | undefined = null;

        switch (column) {
          case 'thumbnailPhoto40': {
            cellData = <Avatar profile={item.node} />;
            break;
          }

          case 'lastName': {
            const { firstName, lastName, middleName } = item.node;
            cellData = `${lastName || ''} ${firstName || ''} ${middleName || ''}`;
            break;
          }

          case 'mobile':
          case 'telephone':
          case 'workPhone':
          case 'company':
          case 'department':
          case 'title': {
            cellData = item.node[column];
            break;
          }

          default: {
            break;
          }
        }

        return [...result, <TableCell key={column}>{cellData}</TableCell>];
      }, [])}
    </TableRow>
  ));
};

const PhoneBook: I18nPage = ({ t, ...rest }): React.ReactElement => {
  const classes = useStyles({});

  const [orderBy, setOrderBy] = useState<Order<ColumnNames>>({
    direction: OrderDirection.ASC,
    field: 'lastName',
  });
  const [columns, setColumns] = useState<ColumnNames[]>(defaultColumns);
  // const [tableData, setTableData] = useState<Profile[]>([]);
  const [ifFetch, setIfFetch] = useState<boolean>(true);

  const [profileId, setProfileId] = useState<string | boolean>(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);

  const [_search, setSearch] = useState<string>('');
  const search = useDebounce(_search, 1000);

  const { loading, error, data, fetchMore } = useQuery(PROFILES(getColumns(columns)), {
    variables: {
      orderBy,
      first: 30,
      after: '',
      search: search.length > 3 ? search : '',
    },
  });

  const handleScrollTable = (e: React.UIEvent<HTMLDivElement>): void => {
    const { scrollTop, scrollHeight, offsetHeight } = e.currentTarget;
    const needFetch = scrollHeight - offsetHeight * 2;

    if (scrollTop <= needFetch || search.length > 3 || !data || !data.profiles || !ifFetch) return;
    setIfFetch(false);

    fetchMore({
      query: PROFILES(getColumns(columns)),
      variables: {
        orderBy,
        after: data.profiles.pageInfo.endCursor,
        first: 30,
        search: search.length > 3 ? search : '',
      },
      updateQuery: (previousResult, { fetchMoreResult }) => {
        const { pageInfo, edges, totalCount, __typename } = fetchMoreResult.profiles;

        if (edges.length <= 0) return previousResult;

        setIfFetch(true);
        const result = previousResult ? [...previousResult.profiles.edges, ...edges] : edges;
        return {
          profiles: {
            __typename,
            totalCount,
            edges: result,
            pageInfo,
          },
        };
      },
    });
  };

  const handleRequestSort = (_: React.MouseEvent<unknown>, property: ColumnNames): void => {
    const isAsc = orderBy.field === property && orderBy.direction === OrderDirection.ASC;
    setOrderBy({
      direction: isAsc ? OrderDirection.DESC : OrderDirection.ASC,
      field: property,
    });
  };

  const createSortHandler = (property: ColumnNames) => (event: React.MouseEvent<unknown>) => {
    handleRequestSort(event, property);
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
          <div
            className={clsx(classes.panel, {
              [classes.panelLoading]: loading,
              [classes.panelNoLoading]: !loading,
            })}
          >
            <div className={classes.search}>
              <div className={classes.searchIcon}>
                <SearchIcon />
              </div>
              <InputBase
                placeholder="Быстрый поиск"
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
          <div id="phonebook-wrap" className={classes.table} onScroll={handleScrollTable}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {allColumns.reduce((result: JSX.Element[], column: ColumnNames): JSX.Element[] => {
                    if (!columns.includes(column) || column === 'disabled') return result;

                    if (column === 'thumbnailPhoto40') {
                      return [...result, <TableCell key={column} />];
                    }

                    return [
                      ...result,
                      <TableCell
                        key={column}
                        // align={column.align}
                        sortDirection={
                          orderBy.field === column ? (orderBy.direction.toLowerCase() as 'desc' | 'asc') : false
                        }
                      >
                        <TableSortLabel
                          active={orderBy.field === column}
                          direction={orderBy.direction.toLowerCase() as 'desc' | 'asc'}
                          onClick={createSortHandler(column)}
                        >
                          {t(`phonebook:fields.${column}`)}
                        </TableSortLabel>
                      </TableCell>,
                    ];
                  }, [])}
                </TableRow>
              </TableHead>
              <TableBody>{getRows(data, columns, handleProfileId)}</TableBody>
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
