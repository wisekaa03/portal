/** @format */

//#region Imports NPM
import React, { useMemo, useEffect } from 'react';
import Head from 'next/head';
import { useQuery, useLazyQuery, ApolloQueryResult } from '@apollo/client';
//#endregion
//#region Imports Local
import { includeDefaultNamespaces, nextI18next, I18nPage } from '@lib/i18n-client';
import { DOCFLOW_TASK, DOCFLOW_TASK_SUB, DOCFLOW_FILE } from '@lib/queries';
import type { DocFlowFile, DocFlowTask, DocFlowTaskInput, DocFlowFileInput } from '@lib/types/docflow';
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
    fetchPolicy: 'cache-and-network',
    variables: { task: { id } },
    notifyOnNetworkStatusChange: true,
  });

  const [getDocFlowTaskFile, { loading: loadingDocFlowTaskFile, data: dataDocFlowTaskFile, error: errorDocFlowTaskFile }] = useLazyQuery<
    Data<'docFlowFile', DocFlowFile>,
    { file: DocFlowFileInput }
  >(DOCFLOW_FILE);

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

  const handleDownload = async (file: DocFlowFile): Promise<void> => {
    if (file.binaryData) {
      download(file.binaryData, `${file.name}.${file.extension}`);
    } else {
      getDocFlowTaskFile({ variables: { file: { id: file.id } } });
    }
  };

  useEffect(() => {
    if (dataDocFlowTaskFile) {
      download(
        dataDocFlowTaskFile?.docFlowFile.binaryData || '',
        `${dataDocFlowTaskFile?.docFlowFile.name}.${dataDocFlowTaskFile?.docFlowFile.extension}`,
      );
    }
  }, [dataDocFlowTaskFile]);

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
  }, [errorDocFlowTask, errorDocFlowTaskFile]);

  return (
    <>
      <Head>
        <title>{t('docflow:title')}</title>
      </Head>
      <MaterialUI refetchComponent={refetchDocFlowTask} {...rest}>
        <DocFlowTaskComponent
          loading={loadingDocFlowTask}
          loadingFile={loadingDocFlowTaskFile}
          task={task}
          handleDownload={handleDownload}
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
