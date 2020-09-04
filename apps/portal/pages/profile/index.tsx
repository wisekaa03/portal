/** @format */

//#region Imports NPM
import React, { useContext, useState, useMemo, useEffect } from 'react';
import Head from 'next/head';
import { useQuery, useMutation, QueryResult } from '@apollo/client';
import Box from '@material-ui/core/Box';
//#endregion
//#region Imports Local
import { TICKETS_TASKS, USER_SETTINGS } from '@lib/queries';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '@lib/i18n-client';
import { ProfileContext } from '@lib/context';
import { TASK_STATUSES } from '@lib/constants';
import snackbarUtils from '@lib/snackbar-utils';
import { Data, TkTask, TkTasks } from '@lib/types';
import { MaterialUI } from '@front/layout';
import ProfileInfoComponent from '@front/components/profile/info';
import ProfileSettingsComponent from '@front/components/profile/settings';
//#endregion

const ProfilePage: I18nPage = ({ t, ...rest }): React.ReactElement => {
  const profile = useContext(ProfileContext);
  // const search = useDebounce(_search, 300);

  const taskStatus = profile?.user?.settings?.task?.status;
  const [status, setStatus] = useState<string>(taskStatus || TASK_STATUSES[0]);
  const [search, setSearch] = useState<string>('');

  const [userSettings, { error: errorSettings }] = useMutation(USER_SETTINGS);

  const {
    loading: loadingTasks,
    data: dataTasks,
    error: errorTasks,
    refetch: refetchTasks,
  }: QueryResult<Data<'TicketsTasks', TkTasks>> = useQuery(TICKETS_TASKS, {
    ssr: false,
    variables: { task: { status, search } },
    fetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  });

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setSearch(event.target.value);
  };

  const handleStatus = (event: React.ChangeEvent<HTMLInputElement>): void => {
    userSettings({
      variables: {
        value: { task: { status: event.target.value === 'Все' ? '' : event.target.value } },
      },
    });
  };

  const tasks = useMemo<TkTask[]>(() => {
    if (dataTasks?.TicketsTasks) {
      if (dataTasks.TicketsTasks.errors) {
        dataTasks.TicketsTasks.errors?.forEach((error) => snackbarUtils.error(error));
      }
      if (dataTasks.TicketsTasks.tasks) {
        return dataTasks.TicketsTasks.tasks;
      }
    }
    return [];
  }, [dataTasks]);

  useEffect(() => {
    if (taskStatus) {
      setStatus(taskStatus);
    }
  }, [taskStatus]);

  useEffect(() => {
    if (errorTasks) {
      snackbarUtils.error(errorTasks);
    }
    if (errorSettings) {
      snackbarUtils.error(errorSettings);
    }
  }, [errorTasks, errorSettings]);

  return (
    <>
      <Head>
        <title>{t('profile:title')}</title>
      </Head>
      <MaterialUI {...rest}>
        <Box display="flex" flexDirection="column" p={1}>
          <ProfileInfoComponent />
          <ProfileSettingsComponent />
        </Box>
      </MaterialUI>
    </>
  );
};

ProfilePage.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['profile']),
});

export default nextI18next.withTranslation('profile')(ProfilePage);
