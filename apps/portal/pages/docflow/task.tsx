/** @format */

//#region Imports NPM
import React, { useState, useMemo, useEffect } from 'react';
import Head from 'next/head';
import { useQuery, useLazyQuery, ApolloQueryResult, useMutation } from '@apollo/client';
//#endregion
//#region Imports Local
import { DocFlowTaskInput /*  DocFlowFileInput */ } from '@back/docflow/graphql';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '@lib/i18n-client';
import { DOCFLOW_TASK, DOCFLOW_TASK_SUB, DOCFLOW_FILE, DOCFLOW_PROCESS_STEP } from '@lib/queries';
import type { /* DocFlowFile, */ DocFlowTask } from '@lib/types/docflow';
import { DocFlowProcessStep, DocFlowData } from '@lib/types/docflow';
import type { Data } from '@lib/types';
import { MaterialUI } from '@front/layout';
import DocFlowTaskComponent from '@front/components/docflow/task';
//#endregion

interface DocFlowTaskProps {
  type: string;
  id: string;
}

const DocFlowTaskPage: I18nPage<DocFlowTaskProps> = ({ t, i18n, type, id, ...rest }) => {
  const {
    loading: loadingDocFlowTask,
    data: dataDocFlowTask,
    error: errorDocFlowTask,
    refetch: refetchDocFlowTaskInt,
    subscribeToMore: subscribeToMoreDocFlowTask,
  } = useQuery<Data<'docFlowTask', DocFlowTask>, { task: DocFlowTaskInput }>(DOCFLOW_TASK, {
    ssr: true,
    fetchPolicy: 'cache-first',
    variables: { task: { type, id } },
    notifyOnNetworkStatusChange: true,
  });

  const loadingDocFlowTaskFile: any = () => false;
  const errorDocFlowTaskFile: any = () => false;
  const handleDownload: any = () => false;

  // const [getDocFlowTaskFile, { loading: loadingDocFlowTaskFile, data: dataDocFlowTaskFile, error: errorDocFlowTaskFile }] = useLazyQuery<
  //   Data<'docFlowFile', DocFlowFile>,
  //   { file: DocFlowFileInput }
  // >(DOCFLOW_FILE);

  const [
    getDocFlowProcessStep,
    { loading: loadingDocFlowProcessStep, data: dataDocFlowProcessStep, error: errorDocFlowProcessStep },
  ] = useMutation<Data<'docFlowProcessStep', DocFlowTask>, { taskID: string; data: DocFlowData }>(DOCFLOW_PROCESS_STEP);

  useEffect(() => {
    if (typeof subscribeToMoreDocFlowTask === 'function') {
      subscribeToMoreDocFlowTask({
        document: DOCFLOW_TASK_SUB,
        variables: { task: { type, id } },
        updateQuery: (prev, { subscriptionData: { data } }) => {
          const updateData = data.docFlowTask;

          return { docFlowTask: updateData };
        },
      });
    }
  }, [subscribeToMoreDocFlowTask, type, id]);

  const handleComments = async (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): Promise<void> => {
    setComments(event.target.value);
  };

  const handleEndDate = async (date: Date | null | undefined, keyboardInputValue?: string | undefined): Promise<void> => {
    setEndDate(date ?? null);
  };

  const handleProcessStep = async (processStep: DocFlowProcessStep, taskID?: string, data?: DocFlowData): Promise<void> => {
    getDocFlowProcessStep({
      variables: {
        taskID: typeof taskID === 'undefined' ? task?.id || '0' : taskID,
        data: {
          processStep,
          comments: typeof data?.comments === 'undefined' ? comments : data.comments,
          endDate: typeof data?.endDate === 'undefined' ? endDate : data.endDate,
        },
      },
    });
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

  // const handleDownload = async (file: DocFlowFile): Promise<void> =>
  //   file.binaryData
  //     ? download(file.binaryData, `${file.name}.${file.extension}`)
  //     : getDocFlowTaskFile({ variables: { file: { id: file.id } } });

  // if (dataDocFlowTaskFile?.docFlowFile) {
  //   download(
  //     dataDocFlowTaskFile.docFlowFile.binaryData || '',
  //     `${dataDocFlowTaskFile.docFlowFile.name}.${dataDocFlowTaskFile.docFlowFile.extension}`,
  //   );
  // }

  const refetchDocFlowTask = async (
    variables?: Partial<{
      task: DocFlowTaskInput;
    }>,
  ): Promise<ApolloQueryResult<Data<'docFlowTask', DocFlowTask>>> =>
    refetchDocFlowTaskInt({ task: { type, id, ...variables?.task, cache: false } });

  const task = useMemo<DocFlowTask | undefined>(() => dataDocFlowTask?.docFlowTask, [dataDocFlowTask]);

  const [comments, setComments] = useState<string>('');
  const [endDate, setEndDate] = useState<Date | null>(null);
  useEffect(() => {
    if (task?.executionComment) {
      setComments(task.executionComment || '');
    }
    if (task?.endDate) {
      setEndDate(task.endDate ?? null);
    }
  }, [task]);

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
          errors={[errorDocFlowTask, errorDocFlowTaskFile, errorDocFlowProcessStep]}
          task={task}
          comments={comments}
          endDate={endDate}
          handleEndDate={handleEndDate}
          handleDownload={handleDownload}
          handleComments={handleComments}
          handleProcessStep={handleProcessStep}
        />
      </MaterialUI>
    </>
  );
};

DocFlowTaskPage.getInitialProps = ({ query }) => {
  const { id, type } = query;

  return {
    id,
    type,
    namespacesRequired: includeDefaultNamespaces(['docflow']),
  };
};

export default nextI18next.withTranslation('docflow')(DocFlowTaskPage);
