/** @format */

//#region Imports NPM
import React, { useState, useContext, useMemo, useEffect } from 'react';
import Head from 'next/head';
import { useQuery, ApolloQueryResult } from '@apollo/client';
//#endregion
//#region Imports Local
import { includeDefaultNamespaces, nextI18next, I18nPage } from '@lib/i18n-client';
import { DOCFLOW_GET_TASKS, DOCFLOW_SUB_TASKS } from '@lib/queries';
import type { DocFlowTask, DocFlowTasksInput } from '@lib/types/docflow';
import { Data } from '@lib/types';
import snackbarUtils from '@lib/snackbar-utils';
import { MaterialUI } from '@front/layout';
import DocFlowTasksComponent from '@front/components/docflow/tasks';
//#endregion

const DocFlowPage: I18nPage = ({ t, i18n, ...rest }): React.ReactElement => {
  const status = '';
  const find = '';

  const {
    loading: loadingDocFlowTasks,
    data: dataDocFlowTasks,
    error: errorDocFlowTasks,
    refetch: refetchDocFlowTasksInt,
    subscribeToMore: subscribeToMoreDocFlowTasks,
  } = useQuery<Data<'docFlowGetTasks', DocFlowTask[]>, { tasks: DocFlowTasksInput }>(DOCFLOW_GET_TASKS, {
    ssr: false,
    fetchPolicy: 'cache-first',
    // notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    // TODO: when a subscription used, a fully object is transmitted to client, old too. try to minimize this.
    subscribeToMoreDocFlowTasks({
      document: DOCFLOW_SUB_TASKS,
      updateQuery: (prev, { subscriptionData: { data } }) => {
        const updateData = data?.docFlowGetTasks || [];

        return { docFlowGetTasks: updateData };
      },
    });
  }, [subscribeToMoreDocFlowTasks]);

  const refetchDocFlowTasks = async (
    variables?: Partial<{
      tasks: DocFlowTasksInput;
    }>,
  ): Promise<ApolloQueryResult<Data<'docFlowGetTasks', DocFlowTask[]>>> =>
    refetchDocFlowTasksInt({ tasks: { ...variables?.tasks, cache: false } });

  const tasks = useMemo<DocFlowTask[]>(() => dataDocFlowTasks?.docFlowGetTasks ?? [], [dataDocFlowTasks]);

  useEffect(() => {
    if (errorDocFlowTasks) {
      snackbarUtils.error(errorDocFlowTasks);
    }
  }, [errorDocFlowTasks]);

  return (
    <>
      <Head>
        <title>{t('docflow:title')}</title>
      </Head>
      <MaterialUI refetchComponent={refetchDocFlowTasks} {...rest}>
        <DocFlowTasksComponent
          loading={loadingDocFlowTasks}
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

DocFlowPage.getInitialProps = ({ query }) => {
  const { code, where } = query;

  return {
    query: { code, where },
    namespacesRequired: includeDefaultNamespaces(['docflow']),
  };
};

export default nextI18next.withTranslation('docflow')(DocFlowPage);
