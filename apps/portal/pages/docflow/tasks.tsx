/** @format */

//#region Imports NPM
import React, { useMemo, useEffect } from 'react';
import Head from 'next/head';
import { useQuery, ApolloQueryResult } from '@apollo/client';
//#endregion
//#region Imports Local
import { includeDefaultNamespaces, nextI18next, I18nPage } from '@lib/i18n-client';
import { DOCFLOW_TASKS, DOCFLOW_TASKS_SUB } from '@lib/queries';
import type { DocFlowTask } from '@lib/types/docflow';
import type { DocFlowTasksInput } from '@back/docflow/graphql';
import type { Data } from '@lib/types';
import { MaterialUI } from '@front/layout';
import DocFlowTasksComponent from '@front/components/docflow/tasks';
//#endregion

const DocFlowTasksPage: I18nPage = ({ t, i18n, ...rest }) => {
  const status = '';
  const find = '';

  const {
    loading: loadingDocFlowTasks,
    data: dataDocFlowTasks,
    error: errorDocFlowTasks,
    refetch: refetchDocFlowTasksInt,
    subscribeToMore: subscribeToMoreDocFlowTasks,
  } = useQuery<Data<'docFlowTasks', DocFlowTask[]>, { tasks: DocFlowTasksInput }>(DOCFLOW_TASKS, {
    ssr: true,
    // TODO: какого-то хера не получается сделать query:fragment и fetchPolicy: 'cache-and-network'
    // fetchPolicy: 'network-only',
    fetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    if (typeof subscribeToMoreDocFlowTasks === 'function') {
      subscribeToMoreDocFlowTasks({
        document: DOCFLOW_TASKS_SUB,
        updateQuery: (prev, { subscriptionData: { data } }) => {
          const updateData = data.docFlowTasks;

          return { docFlowTasks: updateData };
        },
      });
    }
  }, [subscribeToMoreDocFlowTasks]);

  const refetchDocFlowTasks = async (
    variables?: Partial<{
      tasks: DocFlowTasksInput;
    }>,
  ): Promise<ApolloQueryResult<Data<'docFlowTasks', DocFlowTask[]>>> =>
    refetchDocFlowTasksInt({ tasks: { ...variables?.tasks, cache: false } });

  const tasks = useMemo<DocFlowTask[]>(() => dataDocFlowTasks?.docFlowTasks ?? [], [dataDocFlowTasks]);

  return (
    <>
      <Head>
        <title>{t('docflow:title')}</title>
      </Head>
      <MaterialUI refetchComponent={refetchDocFlowTasks} {...rest}>
        <DocFlowTasksComponent
          loading={loadingDocFlowTasks}
          errors={errorDocFlowTasks}
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

DocFlowTasksPage.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['docflow']),
});

export default nextI18next.withTranslation('docflow')(DocFlowTasksPage);
