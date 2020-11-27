/** @format */

//#region Imports NPM
import React, { useState, useContext, useEffect, useCallback, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useQuery, useLazyQuery, useMutation, ApolloQueryResult, ApolloError } from '@apollo/client';
import { Order, OrderDirection, Connection } from 'typeorm-graphql-pagination';
import { Box, useMediaQuery } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
//#endregion
//#region Imports Local
import { I18nPage, includeDefaultNamespaces, nextI18next } from '@lib/i18n-client';
import { Data, ProfileQueryProps, PhonebookColumnNames, UserSettings, Profile, SearchSuggestions, PhonebookFilter } from '@lib/types';
import useDebounce from '@lib/debounce';
import { PROFILES, SEARCH_SUGGESTIONS, USER_SETTINGS } from '@lib/queries';
import { MaterialUI } from '@front/layout';
import { ProfileContext } from '@lib/context';
import snackbarUtils from '@lib/snackbar-utils';
import PhonebookSearch from '@front/components/phonebook/search';
import PhonebookTable from '@front/components/phonebook/table';
import PhonebookProfile from '@front/components/phonebook/profile';
import PhonebookSettings from '@front/components/phonebook/settings';
import PhonebookHelp from '@front/components/phonebook/help';
import Modal from '@front/components/ui/modal';
import Loading from '@front/components/loading';
//#endregion

const columnsXS: PhonebookColumnNames[] = ['thumbnailPhoto40', 'lastName', 'loginDomain', 'workPhone'];
const columnsSM: PhonebookColumnNames[] = [...columnsXS, 'title'];
const columnsMD: PhonebookColumnNames[] = [...columnsSM, 'company', 'department'];
const columnsLG: PhonebookColumnNames[] = [...columnsMD, 'mobile', 'email'];

const getGraphQLColumns = (columns: PhonebookColumnNames[]): string => {
  let result = columns.filter((col) => col !== 'disabled' && col !== 'notShowing').join(' ');

  if (columns.includes('lastName')) {
    result = result.replace('lastName', 'fullName');
  }

  if (columns.includes('manager')) {
    result = result.replace('manager', 'manager { id fullName }');
  }

  return result;
};

const PhonebookPage: I18nPage = ({ t, query, ...rest }) => {
  const theme = useTheme();
  const lgUp = useMediaQuery(theme.breakpoints.up('lg'));
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));
  const largeWidth = useMediaQuery('(min-width:1600px)');

  const router = useRouter();
  const me = useContext(ProfileContext);

  const defaultColumns = me?.user?.settings?.phonebook?.columns || null;

  const defaultFilters = me?.user?.settings?.phonebook?.filters?.map((value) => ({ name: value.name, value: value.value })) || [];

  const [columns, setColumns] = useState<PhonebookColumnNames[]>(
    defaultColumns || (lgUp ? columnsLG : mdUp ? columnsMD : smUp ? columnsSM : columnsXS),
  );
  const [helpOpen, setHelpOpen] = useState<boolean>(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [suggestionsFiltered, setSuggestionsFiltered] = useState<SearchSuggestions[]>([]);
  const [filters, setFilters] = useState<PhonebookFilter[]>(defaultFilters);
  const [orderBy, setOrderBy] = useState<Order<PhonebookColumnNames>>({
    direction: OrderDirection.ASC,
    field: 'lastName',
  });

  const [_search, setSearch] = useState<string>('');
  const search = useDebounce(_search, 300);

  const searchRef: React.MutableRefObject<HTMLInputElement | null> = useRef<HTMLInputElement>(null);

  const isAdmin = Boolean(me?.user?.isAdmin);

  const [userSettings, { error: errorSettings }] = useMutation<UserSettings, { value: UserSettings }>(USER_SETTINGS);

  const [getSearchSuggestions, { loading: suggestionsLoading, data: suggestionsData, error: suggestionsError }] = useLazyQuery<
    Data<'searchSuggestions', SearchSuggestions[]>,
    { search: string }
  >(SEARCH_SUGGESTIONS, {
    ssr: false,
  });

  const { loading, data, error, fetchMore, refetch } = useQuery<Data<'profiles', Connection<Profile>>, ProfileQueryProps>(
    PROFILES(getGraphQLColumns(columns)),
    {
      ssr: false,
      variables: {
        orderBy,
        first: 50,
        after: '',
        search: search.length > 3 ? search : '',
        disabled: columns.includes('disabled'),
        // TODO: for admins only
        notShowing: isAdmin && columns.includes('notShowing'),
        filters,
      },
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
    },
  );

  useEffect(() => {
    if (error) {
      snackbarUtils.error(error);
    }
    if (suggestionsError) {
      snackbarUtils.error(suggestionsError);
    }
    if (errorSettings) {
      snackbarUtils.error(errorSettings);
    }
  }, [error, suggestionsError, errorSettings]);

  // TODO: тут 2 варианта: либо под каждую диагональ свои дефолтные колонки,
  // TODO: либо нет подстановки дефолтных колонок, если есть в settings
  // useEffect(() => {
  //   setColumns(lgUp ? columnsLG : mdUp ? columnsMD : smUp ? columnsSM : columnsXS);
  // }, [lgUp, mdUp, smUp]);

  useEffect(() => {
    if (!suggestionsLoading) {
      const result = suggestionsData?.searchSuggestions;

      if (result?.length && _search.length >= 3) {
        setSuggestionsFiltered(result.length === 1 && result[0]?.name === _search ? [] : result);
      } else {
        setSuggestionsFiltered([]);
      }
    }
  }, [suggestionsLoading, suggestionsData, _search]);

  const fetchFunction = useCallback(
    async (): Promise<undefined | ApolloQueryResult<Data<'profiles', Connection<Profile>>>> =>
      data?.profiles?.pageInfo.endCursor
        ? fetchMore<
            Data<'profiles', Connection<Profile>>,
            ProfileQueryProps,
            'orderBy' | 'after' | 'first' | 'search' | 'disabled' | 'notShowing' | 'filters'
          >({
            query: PROFILES(getGraphQLColumns(columns)),
            variables: {
              orderBy,
              after: data.profiles.pageInfo.endCursor,
              first: 50,
              search: search.length > 3 ? search : '',
              disabled: columns.includes('disabled'),
              notShowing: isAdmin && columns.includes('notShowing'),
              filters,
            },
          })
            .then((result: ApolloQueryResult<Data<'profiles', Connection<Profile>>> | undefined) => {
              console.info(`Total count: ${result?.data.profiles?.totalCount}`);
              return result;
            })
            .catch((e: ApolloError) => {
              snackbarUtils.error(e);
              return undefined;
            })
        : undefined,
    [columns, data, fetchMore, isAdmin, orderBy, search, filters],
  );

  const handleColumns = (columnsVal: PhonebookColumnNames[], filtersVal: PhonebookFilter[]): void => {
    userSettings({
      variables: {
        value: { phonebook: { columns: columnsVal, filters: filtersVal } },
      },
    });
    setColumns(columnsVal);
    setFilters(filtersVal);
  };

  const handleSort = (column: PhonebookColumnNames) => (): void => {
    const isAsc = orderBy.field === column && orderBy.direction === OrderDirection.ASC;
    setOrderBy({
      direction: isAsc ? OrderDirection.DESC : OrderDirection.ASC,
      field: column,
    });
  };

  const actionSearch = (value: string): void => {
    setSearch(value);

    if (value.length >= 3) {
      getSearchSuggestions({
        variables: {
          search: value,
        },
      });
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>): void => actionSearch(event.target.value);

  const handleSugClick = (event: React.MouseEvent<HTMLLIElement, MouseEvent>): void => actionSearch(event.currentTarget.textContent || '');

  const handleProfileClose = (): void => {
    router.push({ pathname: '/phonebook' });
  };

  const handleHelpOpen = (): void => {
    setHelpOpen(true);
  };

  const handleHelpClose = (): void => {
    setHelpOpen(false);
  };

  const handleSettingsOpen = (): void => {
    setSettingsOpen(true);
  };

  const handleSettingsClose = (): void => {
    setSettingsOpen(false);
  };

  const handleSettingsReset = (): void => {
    userSettings({
      variables: {
        value: { phonebook: { columns: [] } },
      },
    });
    setColumns(lgUp ? columnsLG : mdUp ? columnsMD : smUp ? columnsSM : columnsXS);
    setFilters([]);
    setSettingsOpen(false);
  };

  const handleFilters = (event: React.ChangeEvent<Record<string, unknown>>, value: unknown) => {
    setFilters([{ name: 'loginDomain', value: value as string }]);
    refetch();
  };

  const handleSugClose = (event: React.MouseEvent<EventTarget>): void => {
    if (searchRef.current?.contains(event.target as HTMLElement)) {
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

  return (
    <>
      <Head>
        <title>{t('phonebook:title')}</title>
      </Head>
      <MaterialUI refetchComponent={refetch} refetchLoading={loading} {...rest}>
        <Box display="flex" flexDirection="column">
          <PhonebookSearch
            ref={searchRef}
            search={_search}
            suggestions={suggestionsFiltered}
            handleSearch={handleSearch}
            handleSugClose={handleSugClose}
            handleSugKeyDown={handleSugKeyDown}
            handleSugClick={handleSugClick}
            handleHelpOpen={handleHelpOpen}
            handleSettingsOpen={handleSettingsOpen}
          />
          {data?.profiles && (
            <PhonebookTable
              hasLoadMore={!loading}
              loadMoreItems={fetchFunction}
              columns={columns}
              orderBy={orderBy}
              handleSort={handleSort}
              largeWidth={largeWidth}
              data={data.profiles}
            />
          )}
          <Loading activate={loading} noMargin type="linear" variant="indeterminate" />
        </Box>
      </MaterialUI>
      {query && (
        <Modal open={Boolean(query.id)} onClose={handleProfileClose}>
          <PhonebookProfile profileId={query.id} handleClose={handleProfileClose} handleSearch={setSearch} />
        </Modal>
      )}
      <Modal open={helpOpen} onClose={handleHelpClose}>
        <PhonebookHelp onClose={handleHelpClose} />
      </Modal>
      <Modal open={settingsOpen} onClose={handleSettingsClose}>
        <PhonebookSettings
          columns={columns}
          filters={filters}
          handleFilters={handleFilters}
          changeColumn={handleColumns}
          handleClose={handleSettingsClose}
          handleReset={handleSettingsReset}
          isAdmin={isAdmin}
        />
      </Modal>
    </>
  );
};

PhonebookPage.getInitialProps = ({ query }) => ({
  query,
  namespacesRequired: includeDefaultNamespaces(['phonebook']),
});

export default nextI18next.withTranslation('phonebook')(PhonebookPage);
