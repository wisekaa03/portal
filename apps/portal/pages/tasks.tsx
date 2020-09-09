/** @format */

//#region Imports NPM
import React, { useState, useContext, useMemo, useEffect } from 'react';
import Head from 'next/head';
import { useQuery, useMutation, useLazyQuery, QueryResult } from '@apollo/client';
//#endregion
//#region Imports Local
import { ProfileContext } from '@lib/context';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '@lib/i18n-client';
import { TICKETS_TASKS } from '@lib/queries';
import { TkTask, TkTasks, Data, TkWhere, TkEditTask, TkFileInput, TkFile, DropzoneFile } from '@lib/types';
import snackbarUtils from '@lib/snackbar-utils';
import { MaterialUI } from '@front/layout';
import TasksComponent from '@front/components/tasks/tasks';
//#endregion

const TasksPage: I18nPage = ({ t, i18n, ...rest }): React.ReactElement => {
  // const profile = useContext(ProfileContext);
  // const taskStatus = profile?.user?.settings?.task?.status;

  const status = '';
  const search = '';

  const {
    loading: loadingTasks,
    data: dataTasks,
    error: errorTasks,
    refetch: tasksRefetch,
  }: QueryResult<Data<'TicketsTasks', TkTasks>> = useQuery(TICKETS_TASKS, {
    ssr: false,
    variables: { task: { status, search } },
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
      <MaterialUI {...rest}>
        <TasksComponent
          loading={loadingTasks}
          tasks={tasks}
          status={status}
          search={search}
          tasksRefetch={tasksRefetch}
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
