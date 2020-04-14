/** @format */

// #region Imports NPM
import React, { useContext, useState, useEffect } from 'react';
import Head from 'next/head';
import { QueryResult } from 'react-apollo';
import { useQuery, useMutation } from '@apollo/react-hooks';
import Box from '@material-ui/core/Box';
// #endregion
// #region Imports Local
import { OLD_TICKETS, USER_SETTINGS } from '@lib/queries';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '@lib/i18n-client';
// import useDebounce from '../../lib/debounce';
import { ProfileContext } from '@lib/context';
import { TICKET_STATUSES } from '@lib/constants';
import snackbarUtils from '@lib/snackbar-utils';
import { Data, OldTicket } from '@lib/types';
import { MaterialUI } from '@front/layout';
import ProfileInfoComponent from '@front/components/profile/info';
import ProfileTicketsComponent from '@front/components/profile/tickets';
// #endregion

const ProfilePage: I18nPage = ({ t, ...rest }): React.ReactElement => {
  const profile = useContext(ProfileContext);
  // const search = useDebounce(_search, 300);

  const ticketStatus = profile?.user?.settings?.ticket?.status as string | null;
  const [status, setStatus] = useState<string>(ticketStatus || TICKET_STATUSES[0]);
  const [search, setSearch] = useState<string>('');

  const [userSettings, { error: errorSettings }] = useMutation(USER_SETTINGS);

  const {
    loading: loadingTickets,
    data: dataTickets,
    error: errorTickets,
    refetch: refetchTickets,
  }: QueryResult<Data<'OldTickets', OldTicket[]>> = useQuery(OLD_TICKETS, {
    ssr: false,
    variables: { status },
    fetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  });

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setSearch(event.target.value);
  };

  const handleStatus = (event: React.ChangeEvent<HTMLInputElement>): void => {
    userSettings({
      variables: {
        value: { ticket: { status: event.target.value } },
      },
    });
  };

  const tickets: OldTicket[] =
    dataTickets?.OldTickets.filter(
      (ticket: OldTicket) => ticket.code.includes(search) || ticket.name.includes(search),
    ) || [];

  useEffect(() => {
    if (ticketStatus) {
      setStatus(ticketStatus);
    }
  }, [ticketStatus]);

  useEffect(() => {
    if (errorTickets) {
      snackbarUtils.error(errorTickets);
    }
    if (errorSettings) {
      snackbarUtils.error(errorSettings);
    }
  }, [errorTickets, errorSettings]);

  return (
    <>
      <Head>
        <title>{t('profile:title')}</title>
      </Head>
      <MaterialUI {...rest}>
        <Box display="flex" flexDirection="column" p={1}>
          <ProfileInfoComponent />
          <ProfileTicketsComponent
            loading={loadingTickets}
            tickets={tickets}
            status={status}
            search={search}
            refetchTickets={refetchTickets}
            handleSearch={handleSearch}
            handleStatus={handleStatus}
          />
        </Box>
      </MaterialUI>
    </>
  );
};

ProfilePage.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['profile']),
});

export default nextI18next.withTranslation('profile')(ProfilePage);
