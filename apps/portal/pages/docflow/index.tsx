/** @format */

//#region Imports NPM
import React, { useState, useContext, useMemo, useEffect } from 'react';
import Head from 'next/head';
import { useQuery, QueryResult } from '@apollo/client';
//#endregion
//#region Imports Local
import { includeDefaultNamespaces, nextI18next, I18nPage } from '@lib/i18n-client';
import { DOCFLOW_GET_TASKS } from '@lib/queries';
import { DocFlowTask } from '@lib/types/docflow';
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
    refetch: tasksDocFlowTasks,
  }: QueryResult<Data<'DocFlowGetTasks', DocFlowTask[]>> = useQuery(DOCFLOW_GET_TASKS, {
    ssr: false,
    fetchPolicy: 'cache-and-network',
    // notifyOnNetworkStatusChange: true,
  });

  const tasks = useMemo<DocFlowTask[]>(() => dataDocFlowTasks?.DocFlowGetTasks ?? [], [dataDocFlowTasks]);

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
      <MaterialUI refetchComponent={tasksDocFlowTasks} {...rest}>
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
