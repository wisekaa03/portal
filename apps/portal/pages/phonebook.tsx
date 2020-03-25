/** @format */

// #region Imports NPM
import React, { useState, useContext, useEffect, useRef } from 'react';
import { useTheme } from '@material-ui/core/styles';
import { useQuery, useLazyQuery, useMutation } from '@apollo/react-hooks';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Box, useMediaQuery } from '@material-ui/core';
import { Order, OrderDirection } from 'typeorm-graphql-pagination';
// #endregion
// #region Imports Local
import PhonebookControl from '../components/phonebook/control';
import PhonebookTable from '../components/phonebook/table';
import PhonebookProfile from '../components/phonebook/profile';
import PhonebookSettings from '../components/phonebook/settings';
import PhonebookHelp from '../components/phonebook/help';
import { ColumnNames } from '../components/phonebook/types';
import Modal from '../components/ui/modal';
import Loading from '../components/loading';
import Page from '../layouts/main';
import { I18nPage, includeDefaultNamespaces, nextI18next } from '../lib/i18n-client';
import useDebounce from '../lib/debounce';
import { PROFILES, SEARCH_SUGGESTIONS, USER_SETTINGS } from '../lib/queries';
import { ProfileContext } from '../lib/context';
import { Data, ProfileProps, ProfileQueryProps } from '../lib/types';
import snackbarUtils from '../lib/snackbar-utils';
import { UserSettings } from '../src/user/models/user.dto';
// #endregion

const columnsXS: ColumnNames[] = ['thumbnailPhoto40', 'lastName', 'workPhone'];
const columnsSM: ColumnNames[] = [...columnsXS, 'title'];
const columnsMD: ColumnNames[] = [...columnsSM, 'company', 'department'];
const columnsLG: ColumnNames[] = [...columnsMD, 'mobile', 'email'];

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

const PhonebookPage: I18nPage = ({ t, query, ...rest }): React.ReactElement => {
  const theme = useTheme();
  const lgUp = useMediaQuery(theme.breakpoints.up('lg'));
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));
  const largeWidth = useMediaQuery('(min-width:1600px)');

  const router = useRouter();
  const profile = useContext(ProfileContext);

  const defaultColumns = profile?.user?.settings?.phonebook?.columns as ColumnNames[] | null;

  const [columns, setColumns] = useState<ColumnNames[]>(
    defaultColumns || (lgUp ? columnsLG : mdUp ? columnsMD : smUp ? columnsSM : columnsXS),
  );
  const [helpOpen, setHelpOpen] = useState<boolean>(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [suggestionsFiltered, setSuggestionsFiltered] = useState<string[]>([]);
  const [orderBy, setOrderBy] = useState<Order<ColumnNames>>({
    direction: OrderDirection.ASC,
    field: 'lastName',
  });

  const [_search, setSearch] = useState<string>('');
  const search = useDebounce(_search, 300);

  const searchRef = useRef<HTMLInputElement>(null);

  const isAdmin = Boolean(profile?.user?.isAdmin);

  const [userSettings, { error: errorSettings }] = useMutation<UserSettings, { value: UserSettings }>(USER_SETTINGS);

  const [
    getSearchSuggestions,
    { loading: suggestionsLoading, data: suggestionsData, error: suggestionsError },
  ] = useLazyQuery<Data<'searchSuggestions', string[]>, { search: string }>(SEARCH_SUGGESTIONS, { ssr: false });

  const { loading, data, error, fetchMore, refetch } = useQuery<Data<'profiles', ProfileProps>, ProfileQueryProps>(
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
  // TODO: либо нет подстановки дефольных колонок, если есть в settings
  // useEffect(() => {
  //   setColumns(lgUp ? columnsLG : mdUp ? columnsMD : smUp ? columnsSM : columnsXS);
  // }, [lgUp, mdUp, smUp]);

  useEffect(() => {
    if (!suggestionsLoading) {
      const result = suggestionsData?.searchSuggestions;

      if (result?.length && _search.length >= 3) {
        setSuggestionsFiltered(result.length === 1 && result[0] === _search ? [] : result);
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
    }).catch((err) => snackbarUtils.error(err));

  const handleColumns = (values: ColumnNames[]): void => {
    userSettings({
      variables: {
        value: { phonebook: { columns: values } },
      },
    });
    setColumns(values);
  };

  const handleSort = (column: ColumnNames) => (): void => {
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

  const handleSugClick = (event: React.MouseEvent<HTMLLIElement, MouseEvent>): void =>
    actionSearch(event.currentTarget.innerText);

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
        value: { phonebook: { columns: null } },
      },
    });
    setColumns(lgUp ? columnsLG : mdUp ? columnsMD : smUp ? columnsSM : columnsXS);
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

  return (
    <>
      <Head>
        <title>{t('phonebook:title')}</title>
      </Head>
      <Page {...rest}>
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
            handleHelpOpen={handleHelpOpen}
            handleSettingsOpen={handleSettingsOpen}
          />
          <PhonebookTable
            hasLoadMore={!loading}
            loadMoreItems={fetchFunction}
            columns={columns}
            orderBy={orderBy}
            handleSort={handleSort}
            largeWidth={largeWidth}
            data={data?.profiles}
          />
          <Loading activate={loading} noMargin type="linear" variant="indeterminate" />
        </Box>
      </Page>
      <Modal open={Boolean(query.id)} onClose={handleProfileClose}>
        <PhonebookProfile profileId={query.id} handleClose={handleProfileClose} handleSearch={setSearch} />
      </Modal>
      <Modal open={helpOpen} onClose={handleHelpClose}>
        <PhonebookHelp onClose={handleHelpClose} />
      </Modal>
      <Modal open={settingsOpen} onClose={handleSettingsClose}>
        <PhonebookSettings
          columns={columns}
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
