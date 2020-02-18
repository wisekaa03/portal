/** @format */

// #region Imports NPM
import React, { useState, useContext, useEffect, useRef } from 'react';
import { useTheme } from '@material-ui/core/styles';
import { QueryResult } from 'react-apollo';
import { useQuery, useLazyQuery } from '@apollo/react-hooks';
import Head from 'next/head';
import { Box, useMediaQuery } from '@material-ui/core';
import { Order, OrderDirection } from 'typeorm-graphql-pagination';
// #endregion
// #region Imports Local
import PhonebookControl from '../components/phonebook/control';
import PhonebookTable from '../components/phonebook/table';
import PhonebookProfile from '../components/phonebook/profile';
import PhonebookSettings from '../components/phonebook/settings';
import { ColumnNames } from '../components/phonebook/types';
import Modal from '../components/ui/modal';
import { Loading } from '../components/loading';
import Page from '../layouts/main';
import { I18nPage, includeDefaultNamespaces, nextI18next } from '../lib/i18n-client';
import useDebounce from '../lib/debounce';
import { PROFILES, SEARCH_SUGGESTIONS } from '../lib/queries';
import { ProfileContext } from '../lib/context';
import { Data, ProfileProps } from '../lib/types';
// #endregion

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

const getGraphQLColumns = (columns: ColumnNames[]): string => {
  let result = columns.filter((col) => col !== 'disabled' && col !== 'notShowing').join(' ');

  if (columns.includes('lastName')) {
    result = result.replace('lastName', 'fullName');
  }

  if (columns.includes('manager')) {
    result = result.replace('manager', 'manager { id fullName }');
  }

  return result;
};

const PhoneBook: I18nPage = (props): React.ReactElement => {
  const { t } = props;

  const theme = useTheme();
  const lgUp = useMediaQuery(theme.breakpoints.up('lg'));
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));
  const largeWidth = useMediaQuery('(min-width:1600px)');

  const profile = useContext(ProfileContext);

  const [profileId, setProfileId] = useState<string | false>(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [suggestionsFiltered, setSuggestionsFiltered] = useState<string[]>([]);
  const [columns, setColumns] = useState<ColumnNames[]>(defaultColumnsLG);
  const [orderBy, setOrderBy] = useState<Order<ColumnNames>>({
    direction: OrderDirection.ASC,
    field: 'lastName',
  });

  const [_search, setSearch] = useState<string>('');
  const search = useDebounce(_search, 300);

  const searchRef = useRef<HTMLInputElement>(null);

  const isAdmin = Boolean(profile?.user?.isAdmin);

  const [
    getSearchSuggestions,
    { loading: suggestionsLoading, data: suggestionsData },
  ] = useLazyQuery(SEARCH_SUGGESTIONS, { ssr: false });

  // TODO: вставить сюда роутинг по id конкретного юзера

  const { loading, data, fetchMore, refetch }: QueryResult<Data<'profiles', ProfileProps>> = useQuery(
    PROFILES(getGraphQLColumns(columns)),
    {
      ssr: false,
      variables: {
        orderBy,
        first: 100,
        after: '',
        search: search.length > 3 ? search : '',
        disabled: columns.includes('disabled'),
        // TODO: для админов
        notShowing: isAdmin && columns.includes('notShowing'),
      },
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
    },
  );

  useEffect(() => {
    setColumns(lgUp ? defaultColumnsLG : mdUp ? defaultColumnsMD : smUp ? defaultColumnsSM : defaultColumnsXS);
  }, [lgUp, mdUp, smUp]);

  useEffect(() => {
    if (!suggestionsLoading) {
      if (suggestionsData && suggestionsData.searchSuggestions.length && _search.length >= 3) {
        const filtered = suggestionsData.searchSuggestions.reduce((result: string[], cur: any) => {
          if (result.length > 4) return result;

          const lower = _search.toLowerCase().trim();
          let showing = '';

          if (cur.fullName.toLowerCase().includes(lower)) {
            showing = cur.fullName;
          } else if (cur.department && cur.department.toLowerCase().includes(lower)) {
            showing = cur.department;
          } else if (cur.company && cur.company.toLowerCase().includes(lower)) {
            showing = cur.company;
          } else if (cur.title && cur.title.toLowerCase().includes(lower)) {
            showing = cur.title;
          }
          showing = showing.trim();

          if (result.includes(showing) || showing === '') return result;

          return [...result, showing];
        }, []);

        setSuggestionsFiltered(filtered.length === 1 && filtered[0] === _search ? [] : filtered);
      } else {
        setSuggestionsFiltered([]);
      }
    }
  }, [suggestionsLoading, suggestionsData, _search]);

  const fetchFunction = (): any =>
    fetchMore({
      query: PROFILES(getGraphQLColumns(columns)),
      variables: {
        orderBy,
        after: data.profiles.pageInfo.endCursor,
        first: 100,
        search: search.length > 3 ? search : '',
        disabled: columns.includes('disabled'),
        notShowing: isAdmin && columns.includes('notShowing'),
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

  const handleSort = (column: ColumnNames) => (): void => {
    const isAsc = orderBy.field === column && orderBy.direction === OrderDirection.ASC;
    setOrderBy({
      direction: isAsc ? OrderDirection.DESC : OrderDirection.ASC,
      field: column,
    });
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const { value } = event.target;
    setSearch(value);

    if (value.length >= 3) {
      getSearchSuggestions({
        variables: {
          search: value,
        },
      });
    }
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

  const handleSugClose = (event: React.MouseEvent<EventTarget>): void => {
    if (searchRef.current && searchRef.current.contains(event.target as HTMLElement)) {
      return;
    }

    setSuggestionsFiltered([]);
  };

  const handleSugKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key === 'Tab') {
      event.preventDefault();
      setSuggestionsFiltered([]);
    }
  };

  const handleSugClick = (value: string) => (): void => {
    setSearch(value);
  };

  return (
    <>
      <Head>
        <title>{t('phonebook:title')}</title>
      </Head>
      <Page {...props}>
        <Box display="flex" flexDirection="column">
          <PhonebookControl
            searchRef={searchRef}
            search={_search}
            suggestions={suggestionsFiltered}
            refetch={refetch}
            handleSearch={handleSearch}
            handleSugClose={handleSugClose}
            handleSugKeyDown={handleSugKeyDown}
            handleSugClick={handleSugClick}
            handleSettingsOpen={handleSettingsOpen}
          />
          <PhonebookTable
            hasLoadMore={!loading}
            loadMoreItems={fetchFunction}
            columns={columns}
            orderBy={orderBy}
            handleSort={handleSort}
            largeWidth={largeWidth}
            data={data && data.profiles}
            handleProfileId={handleProfileId}
          />
          {loading && <Loading noMargin type="linear" variant="indeterminate" />}
        </Box>
      </Page>
      <Modal open={Boolean(profileId)} onClose={handleProfileClose}>
        <PhonebookProfile profileId={profileId} handleClose={handleProfileClose} handleSearch={setSearch} />
      </Modal>
      <Modal open={settingsOpen} onClose={handleSettingsClose}>
        <PhonebookSettings
          columns={columns}
          changeColumn={setColumns}
          handleClose={handleSettingsClose}
          isAdmin={isAdmin}
        />
      </Modal>
    </>
  );
};

PhoneBook.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['phonebook']),
});

export default nextI18next.withTranslation('phonebook')(PhoneBook);
