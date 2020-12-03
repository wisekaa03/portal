/** @format */

//#region Imports NPM
import React, { useMemo, useEffect } from 'react';
import Head from 'next/head';
import { useQuery, useLazyQuery, ApolloQueryResult, useMutation } from '@apollo/client';
//#endregion
//#region Imports Local
import { includeDefaultNamespaces, nextI18next, I18nPage } from '@lib/i18n-client';
import { DOCFLOW_TASK, DOCFLOW_TASK_SUB, DOCFLOW_FILE, DOCFLOW_PROCESS_STEP } from '@lib/queries';
import type { DocFlowFile, DocFlowTask, DocFlowTaskInput, DocFlowFileInput } from '@lib/types/docflow';
import { DocFlowProcessStep } from '@lib/types/docflow';
import { Data } from '@lib/types';
import snackbarUtils from '@lib/snackbar-utils';
import { MaterialUI } from '@front/layout';
import DocFlowTaskComponent from '@front/components/docflow/task';
//#endregion

interface DocFlowTaskProps {
  id: string;
}

const DocFlowTaskPage: I18nPage<DocFlowTaskProps> = ({ t, i18n, id, ...rest }) => {
  const {
    loading: loadingDocFlowTask,
    data: dataDocFlowTask,
    error: errorDocFlowTask,
    refetch: refetchDocFlowTaskInt,
    subscribeToMore: subscribeToMoreDocFlowTask,
  } = useQuery<Data<'docFlowTask', DocFlowTask>, { task: DocFlowTaskInput }>(DOCFLOW_TASK, {
    ssr: true,
    fetchPolicy: 'cache-and-network',
    variables: { task: { id } },
    // notifyOnNetworkStatusChange: true,
  });

  const [getDocFlowTaskFile, { loading: loadingDocFlowTaskFile, data: dataDocFlowTaskFile, error: errorDocFlowTaskFile }] = useLazyQuery<
    Data<'docFlowFile', DocFlowFile>,
    { file: DocFlowFileInput }
  >(DOCFLOW_FILE);

  const [
    getDocFlowProcessStep,
    { loading: loadingDocFlowProcessStep, data: dataDocFlowProcessStep, error: errorDocFlowProcessStep },
  ] = useMutation<Data<'docFlowProcessStep', DocFlowTask>, { taskID: string; step: DocFlowProcessStep }>(DOCFLOW_PROCESS_STEP);

  useEffect(() => {
    if (typeof subscribeToMoreDocFlowTask === 'function') {
      subscribeToMoreDocFlowTask({
        document: DOCFLOW_TASK_SUB,
        variables: { task: { id } },
        updateQuery: (prev, { subscriptionData: { data } }) => {
          const updateData = data.docFlowTask;

          return { docFlowTask: updateData };
        },
      });
    }
  }, [subscribeToMoreDocFlowTask, id]);

  const handleProcessStep = async (taskID: string, step: DocFlowProcessStep): Promise<void> => {
    getDocFlowProcessStep({ variables: { taskID, step } });
  };

  const download = async (body: string, name: string): Promise<void> => {
    const blob = new Blob([Buffer.from(body, 'base64')], { type: 'application/octet-stream' });
    const temp = window.URL.createObjectURL(blob);
    const tempLink = document.createElement('a');
    tempLink.href = temp;
    tempLink.setAttribute('download', name || '');
    document.body.appendChild(tempLink);
    tempLink.click();
    setTimeout(() => {
      document.body.removeChild(tempLink);
      window.URL.revokeObjectURL(temp);
    }, 100);
  };

  const handleDownload = async (file: DocFlowFile): Promise<void> =>
    file.binaryData
      ? download(file.binaryData, `${file.name}.${file.extension}`)
      : getDocFlowTaskFile({ variables: { file: { id: file.id } } });

  if (dataDocFlowTaskFile?.docFlowFile) {
    download(
      dataDocFlowTaskFile.docFlowFile.binaryData || '',
      `${dataDocFlowTaskFile.docFlowFile.name}.${dataDocFlowTaskFile.docFlowFile.extension}`,
    );
  }

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
    if (errorDocFlowTaskFile) {
      snackbarUtils.error(errorDocFlowTaskFile);
    }
    if (errorDocFlowProcessStep) {
      snackbarUtils.error(errorDocFlowProcessStep);
    }
  }, [errorDocFlowTask, errorDocFlowTaskFile, errorDocFlowProcessStep]);

  return (
    <>
      <Head>
        <title>{t('docflow:title')}</title>
      </Head>
      <MaterialUI refetchComponent={refetchDocFlowTask} {...rest}>
        <DocFlowTaskComponent
          loading={loadingDocFlowTask}
          loadingFile={loadingDocFlowTaskFile}
          loadingProcessStep={loadingDocFlowProcessStep}
          task={task}
          handleDownload={handleDownload}
          handleProcessStep={handleProcessStep}
        />
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
