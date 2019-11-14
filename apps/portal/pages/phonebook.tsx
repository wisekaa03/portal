/** @format */

// #region Imports NPM
import React, { useState, forwardRef, createContext, useEffect, useRef } from 'react';
import { fade, Theme, makeStyles, createStyles, useTheme } from '@material-ui/core/styles';
import { useQuery, useLazyQuery } from '@apollo/react-hooks';
import Head from 'next/head';
import {
  Table,
  TableBody,
  TableCell,
  TableSortLabel,
  TableRow,
  InputBase,
  IconButton,
  Modal,
  useMediaQuery,
  Popper,
  ClickAwayListener,
  MenuList,
  MenuItem,
  Paper,
} from '@material-ui/core';
import { Search as SearchIcon, Settings as SettingsIcon } from '@material-ui/icons';
import { red } from '@material-ui/core/colors';
import { Order, OrderDirection } from 'typeorm-graphql-pagination';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import InfiniteLoader from 'react-window-infinite-loader';
import clsx from 'clsx';
// #endregion
// #region Imports Local
import Page from '../layouts/main';
import { I18nPage, includeDefaultNamespaces, nextI18next } from '../lib/i18n-client';
import { Column, ColumnNames, HeaderProps } from '../components/phonebook/types';
import { ProfileComponent } from '../components/phonebook/profile';
import { SettingsComponent, allColumns } from '../components/phonebook/settings';
import useDebounce from '../lib/debounce';
import { Loading } from '../components/loading';
import { Avatar } from '../components/avatar';
import { PROFILES, SEARCH_SUGGESTIONS } from '../lib/queries';
// #endregion

const panelHeight = 48;
const rowHeight = 72;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
    },
    panel: {
      height: panelHeight,
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#F7FBFA',
      borderBottom: '1px solid rgba(224, 224, 224, 1)',
    },
    tableWrapper: {
      display: 'flex',
      flex: 1,
    },
    table: {
      display: 'flex',
      flexDirection: 'column',
    },
    tbody: {
      flex: 1,
    },
    header: {
      position: 'sticky',
      top: 0,
      background: '#fff',
      zIndex: 2,
      boxShadow: '0px 0px 5px 2px rgba(0, 0, 0, 0.2)',
    },
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
    disabled: {
      color: red[600],
    },
    search: {
      'flex': 1,
      'position': 'relative',
      'backgroundColor': fade(theme.palette.common.white, 0.15),
      'marginRight': theme.spacing(2),
      'marginLeft': 0,
      '&:hover': {
        backgroundColor: fade(theme.palette.common.white, 0.25),
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
    },
    modal: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    suggestionsPopper: {
      zIndex: theme.zIndex.appBar,
      marginLeft: theme.spacing(7),
    },
  }),
);

const defaultColumnsLG: ColumnNames[] = [
  'thumbnailPhoto40',
  'lastName',
  'company',
  'department',
  'title',
  'mobile',
  'workPhone',
];
const defaultColumnsMD: ColumnNames[] = ['thumbnailPhoto40', 'lastName', 'company', 'department', 'title', 'workPhone'];
const defaultColumnsSM: ColumnNames[] = ['thumbnailPhoto40', 'lastName', 'title', 'workPhone'];
const defaultColumnsXS: ColumnNames[] = ['thumbnailPhoto40', 'lastName'];

// const sortData = (order: Order, orderBy: ColumnNames) => (a: BookProps, b: BookProps) => {
//   const asc: number = order === 'asc' ? 1 : -1;

//   return a[orderBy] > b[orderBy] ? asc * 1 : a[orderBy] < b[orderBy] ? asc * -1 : 0;
// };

const itemKey = (index: number, data: any): string => data.items[index].node.id;

const getGraphQLColumns = (columns: ColumnNames[]): string => {
  let result = columns.filter((col) => col !== 'disabled').join(' ');

  if (columns.includes('lastName')) {
    result += ' firstName middleName';
  }

  if (columns.includes('manager')) {
    result = result.replace('manager', 'manager { id firstName lastName middleName }');
  }

  return result;
};

const HeaderContext = createContext<HeaderProps | undefined>(undefined);
HeaderContext.displayName = 'HeaderContext';

const InnerElementList = forwardRef<React.Component, any>(({ children, style, ...rest }, ref) => (
  <HeaderContext.Consumer>
    {(context) => (
      <div ref={ref} {...rest} style={{ height: style.height, flex: 1 }}>
        <>
          {context && (
            <TableRow component="div" className={clsx(context.classes.row, context.classes.header)}>
              {allColumns.reduce((result: JSX.Element[], column: Column): JSX.Element[] => {
                const { name, defaultStyle, largeStyle } = column;
                const cellStyle = { height: rowHeight, ...(context.largeWidth ? largeStyle : defaultStyle) };

                if (!context.columns.includes(name) || name === 'disabled') return result;

                if (name === 'thumbnailPhoto40') {
                  return [
                    ...result,
                    <TableCell key={name} className={context.classes.cell} component="div" style={cellStyle} />,
                  ];
                }

                return [
                  ...result,
                  <TableCell
                    key={name}
                    className={context.classes.cell}
                    component="div"
                    scope="col"
                    style={cellStyle}
                    sortDirection={
                      context.orderBy.field === name
                        ? (context.orderBy.direction.toLowerCase() as 'desc' | 'asc')
                        : false
                    }
                  >
                    <TableSortLabel
                      active={context.orderBy.field === name}
                      direction={context.orderBy.direction.toLowerCase() as 'desc' | 'asc'}
                      onClick={context.handleRequestSort(name)}
                    >
                      {context.t(`phonebook:fields.${name}`)}
                    </TableSortLabel>
                  </TableCell>,
                ];
              }, [])}
            </TableRow>
          )}
          {children}
        </>
      </div>
    )}
  </HeaderContext.Consumer>
));
InnerElementList.displayName = 'InnerElementList';

const Row: React.FC<ListChildComponentProps> = ({ index, style: { width, top, ...rest }, data }) => {
  const item = data.items[index].node;
  const { columns, handleProfileId, classes, largeWidth } = data;

  return (
    <TableRow
      component="div"
      className={classes.row}
      hover
      style={{ ...rest, top: `${parseFloat(top as string) + rowHeight}px` }}
      onClick={handleProfileId(item.id)}
    >
      {allColumns.reduce((result: JSX.Element[], column: Column): JSX.Element[] => {
        const { name, defaultStyle, largeStyle } = column;
        const cellStyle = { height: rowHeight, ...(largeWidth ? largeStyle : defaultStyle) };

        if (!columns.includes(name) || name === 'disabled') return result;

        let cellData: React.ReactElement | string | null | undefined = null;

        switch (name) {
          case 'thumbnailPhoto40': {
            cellData = <Avatar profile={item} />;
            break;
          }

          case 'lastName': {
            const { firstName, lastName, middleName } = item;
            cellData = `${lastName || ''} ${firstName || ''} ${middleName || ''}`;
            break;
          }

          case 'manager': {
            if (!item.manager) {
              break;
            }

            const { firstName, lastName, middleName } = item.manager;
            cellData = `${lastName || ''} ${firstName || ''} ${middleName || ''}`;
            break;
          }

          case 'nameEng':
          case 'username':
          case 'company':
          case 'companyEng':
          case 'department':
          case 'departmentEng':
          case 'otdel':
          case 'otdelEng':
          case 'title':
          case 'positionEng':
          case 'room':
          case 'telephone':
          case 'fax':
          case 'mobile':
          case 'workPhone':
          case 'email':
          case 'country':
          case 'region':
          case 'town':
          case 'street': {
            cellData = item[name];
            break;
          }

          default: {
            break;
          }
        }

        return [
          ...result,
          <TableCell
            key={name}
            className={clsx(classes.cell, {
              [classes.disabled]: item.disabled && name === 'lastName',
            })}
            style={cellStyle}
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
  const [columns, setColumns] = useState<ColumnNames[]>(defaultColumnsLG);

  const theme = useTheme();
  const lgUp = useMediaQuery(theme.breakpoints.up('lg'));
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));
  const largeWidth = useMediaQuery('(min-width:1600px)');

  useEffect(() => {
    setColumns(lgUp ? defaultColumnsLG : mdUp ? defaultColumnsMD : smUp ? defaultColumnsSM : defaultColumnsXS);
  }, [lgUp, mdUp, smUp]);

  const [profileId, setProfileId] = useState<string | false>(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [searchSuggestionsOpen, setSearchSuggestionsOpen] = useState<boolean>(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const [_search, setSearch] = useState<string>('');
  const search = useDebounce(_search, 1000);

  const { loading, error, data, fetchMore } = useQuery(PROFILES(getGraphQLColumns(columns)), {
    variables: {
      orderBy,
      first: search.length > 3 ? 100 : 50,
      after: '',
      search: search.length > 3 ? search : '',
      disabled: columns.includes('disabled'),
    },
    fetchPolicy: 'cache-and-network',
  });

  const [getSearchSuggestions, { loading: suggestionsLoading, data: suggestionsData }] = useLazyQuery(
    SEARCH_SUGGESTIONS,
  );

  useEffect(() => {
    _search.length >= 3 &&
      getSearchSuggestions({
        variables: {
          search: _search,
        },
      });
  }, [_search, getSearchSuggestions]);

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
        disabled: columns.includes('disabled'),
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        const { pageInfo, edges, totalCount } = fetchMoreResult.profiles;

        if (edges.length === 0) return prev;
        const clean: string[] = [];

        return {
          ...prev,
          profiles: {
            ...prev.profiles,
            totalCount,
            edges: [...prev.profiles.edges, ...edges].filter(
              (edge) => !clean.includes(edge.node.id) && clean.push(edge.node.id),
            ),
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
    const searchString = event.target.value;
    setSearch(searchString);
    !suggestionsLoading &&
      setSearchSuggestionsOpen(
        !!(suggestionsData && suggestionsData.searchSuggestions.length && searchString.length >= 3),
      );
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

  const prevOpen = useRef(searchSuggestionsOpen);
  useEffect(() => {
    if (prevOpen.current === true && searchSuggestionsOpen === false) {
      searchRef.current!.focus();
    }

    prevOpen.current = searchSuggestionsOpen;
  }, [searchSuggestionsOpen]);

  const handleSearchSuggestionsClose = (event: React.MouseEvent<EventTarget>): void => {
    if (searchRef.current && searchRef.current.contains(event.target as HTMLElement)) {
      return;
    }

    setSearchSuggestionsOpen(false);
  };

  const handleSuggestionsKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key === 'Tab') {
      event.preventDefault();
      setSearchSuggestionsOpen(false);
    }
  };

  const handleSuggestionsItemClick = (value: string) => (): void => {
    value && setSearch(value);
    setSearchSuggestionsOpen(false);
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
                ref={searchRef}
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
              <Popper
                id="search-suggestions"
                placement="bottom-start"
                className={classes.suggestionsPopper}
                open={searchSuggestionsOpen}
                anchorEl={searchRef.current}
                disablePortal
              >
                <Paper>
                  {suggestionsData && (
                    <ClickAwayListener onClickAway={handleSearchSuggestionsClose}>
                      <MenuList onKeyDown={handleSuggestionsKeyDown}>
                        {suggestionsData.searchSuggestions.reduce((result: JSX.Element[], cur: any) => {
                          if (result.length > 4) return result;

                          const lower = _search.toLowerCase();
                          let showing = '';

                          if (
                            (cur.lastName && cur.lastName.toLowerCase().includes(lower)) ||
                            (cur.firstName && cur.firstName.toLowerCase().includes(lower)) ||
                            (cur.middleName && cur.middleName.toLowerCase().includes(lower))
                          ) {
                            showing = `${cur.lastName || ''} ${cur.firstName || ''} ${cur.middleName || ''}`;
                          } else if (cur.department && cur.department.toLowerCase().includes(lower)) {
                            showing = cur.department;
                          } else if (cur.company && cur.company.toLowerCase().includes(lower)) {
                            showing = cur.company;
                          } else if (cur.title && cur.title.toLowerCase().includes(lower)) {
                            showing = cur.title;
                          }
                          showing = showing.trim();

                          if (result.find((item) => item.key === showing) || showing === '') return result;

                          return [
                            ...result,
                            <MenuItem key={showing} onClick={handleSuggestionsItemClick(showing)}>
                              {showing}
                            </MenuItem>,
                          ];
                        }, [])}
                      </MenuList>
                    </ClickAwayListener>
                  )}
                </Paper>
              </Popper>
            </div>
            <IconButton onClick={handleSettingsOpen}>
              <SettingsIcon />
            </IconButton>
          </div>
          <div id="phonebook-wrap" className={classes.tableWrapper}>
            <Table component="div" className={classes.table}>
              <TableBody component="div" className={classes.tbody}>
                <AutoSizer disableWidth>
                  {({ height }) => (
                    <InfiniteLoader isItemLoaded={isItemLoaded} itemCount={itemCount} loadMoreItems={loadMoreItems}>
                      {({ onItemsRendered, ref }) => (
                        <HeaderContext.Provider value={{ columns, orderBy, handleRequestSort, t, classes, largeWidth }}>
                          <List
                            style={{ display: 'flex' }}
                            ref={ref}
                            onItemsRendered={onItemsRendered}
                            width="100%"
                            height={height}
                            itemCount={data ? data.profiles.edges.length : 0}
                            itemSize={rowHeight}
                            itemKey={itemKey}
                            innerElementType={InnerElementList}
                            itemData={{
                              classes,
                              items: data ? data.profiles.edges : [],
                              columns,
                              handleProfileId,
                              largeWidth,
                            }}
                          >
                            {Row}
                          </List>
                        </HeaderContext.Provider>
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
