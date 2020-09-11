/** @format */

//#region Imports NPM
import React, { useMemo, useEffect } from 'react';
import Head from 'next/head';
import { useQuery, QueryResult } from '@apollo/client';
//#endregion
//#region Imports Local
import type { TkTask, TkTasks, TkTasksInput, Data } from '@lib/types';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '@lib/i18n-client';
import { TICKETS_TASKS } from '@lib/queries';
import snackbarUtils from '@lib/snackbar-utils';
import { MaterialUI } from '@front/layout';
import TasksComponent from '@front/components/tasks/tasks';
//#endregion

const TasksPage: I18nPage = ({ t, i18n, ...rest }): React.ReactElement => {
  // const profile = useContext(ProfileContext);
  // const taskStatus = profile?.user?.settings?.task?.status;

  const status = '';
  const find = '';

  const {
    loading: loadingTasks,
    data: dataTasks,
    error: errorTasks,
    refetch: tasksRefetch,
  }: QueryResult<Data<'TicketsTasks', TkTasks>, { tasks: TkTasksInput }> = useQuery(TICKETS_TASKS, {
    ssr: false,
    variables: { tasks: { status, find } },
    fetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  });

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
    if (errorTasks) {
      snackbarUtils.error(errorTasks);
    }
  }, [errorTasks]);

  return (
    <>
      <Head>
        <title>{t('tasks:title')}</title>
      </Head>
      <MaterialUI refetchComponent={tasksRefetch} {...rest}>
        <TasksComponent
          loading={loadingTasks}
          tasks={tasks}
          status={status}
          find={find}
          handleSearch={(event) => {
            event?.preventDefault();
          }}
          handleStatus={(event) => {
            event?.preventDefault();
          }}
        />
      </MaterialUI>
    </>
  );
};

TasksPage.getInitialProps = ({ query }) => {
  const { code, where } = query;

  return {
    query: { code, where },
    namespacesRequired: includeDefaultNamespaces(['tasks']),
  };
};

export default nextI18next.withTranslation('tasks')(TasksPage);
