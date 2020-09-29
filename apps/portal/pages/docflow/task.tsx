/** @format */

//#region Imports NPM
import React, { useState, useContext, useMemo, useEffect } from 'react';
import Head from 'next/head';
import { useQuery, ApolloQueryResult } from '@apollo/client';
//#endregion
//#region Imports Local
import { includeDefaultNamespaces, nextI18next, I18nPage } from '@lib/i18n-client';
import { DOCFLOW_TASK, DOCFLOW_TASK_SUB } from '@lib/queries';
import type { DocFlowTask, DocFlowTaskInput, DocFlowTasksInput } from '@lib/types/docflow';
import { Data } from '@lib/types';
import snackbarUtils from '@lib/snackbar-utils';
import { MaterialUI } from '@front/layout';
import DocFlowTaskComponent from '@front/components/docflow/task';
//#endregion

interface DocFlowTaskProps {
  id: string;
}

const DocFlowTaskPage: I18nPage<DocFlowTaskProps> = ({ t, i18n, id, ...rest }): React.ReactElement => {
  const {
    loading: loadingDocFlowTask,
    data: dataDocFlowTask,
    error: errorDocFlowTask,
    refetch: refetchDocFlowTaskInt,
    subscribeToMore: subscribeToMoreDocFlowTask,
  } = useQuery<Data<'docFlowTask', DocFlowTask>, { task: DocFlowTaskInput }>(DOCFLOW_TASK, {
    ssr: true,
    fetchPolicy: 'cache-first',
    variables: { task: { id } },
    // notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    // TODO: when a subscription used, a fully object is transmitted to client, old too. try to minimize this.
    subscribeToMoreDocFlowTask({
      document: DOCFLOW_TASK_SUB,
      variables: { task: { id } },
      updateQuery: (prev, { subscriptionData: { data } }) => {
        const updateData = data?.docFlowTask || [];

        return { docFlowTask: updateData };
      },
    });
  }, [subscribeToMoreDocFlowTask, id]);

  const refetchDocFlowTask = async (
    variables?: Partial<{
      task: DocFlowTaskInput;
    }>,
  ): Promise<ApolloQueryResult<Data<'docFlowTask', DocFlowTask>>> =>
    refetchDocFlowTaskInt({ task: { id, ...variables?.task, cache: false } });

  const task = useMemo<DocFlowTask | undefined>(() => dataDocFlowTask?.docFlowTask, [dataDocFlowTask]);

  useEffect(() => {
    if (errorDocFlowTask) {
      snackbarUtils.error(errorDocFlowTask);
    }
  }, [errorDocFlowTask]);

  return (
    <>
      <Head>
        <title>{t('docflow:title')}</title>
      </Head>
      <MaterialUI refetchComponent={refetchDocFlowTask} {...rest}>
        <DocFlowTaskComponent loading={loadingDocFlowTask} task={task} />
      </MaterialUI>
    </>
  );
};

DocFlowTaskPage.getInitialProps = ({ query }) => {
  const { id } = query;

  return {
    id,
    namespacesRequired: includeDefaultNamespaces(['docflow']),
  };
};

export default nextI18next.withTranslation('docflow')(DocFlowTaskPage);
