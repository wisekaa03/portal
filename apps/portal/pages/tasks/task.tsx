/** @format */

//#region Imports NPM
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useQuery, useMutation, ApolloQueryResult } from '@apollo/client';
//#endregion
//#region Imports Local
import dateFormat from '@lib/date-format';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '@lib/i18n-client';
import { TICKETS_TASK, TICKETS_TASK_SUB, TICKETS_TASK_EDIT, TICKETS_TASK_FILE, TICKETS_COMMENT } from '@lib/queries';
import type { Data, TkTask, TkEditTask, TkFileInput, TkFile, DropzoneFile, TkTaskInput, TkTaskEditInput } from '@lib/types';
import { TkWhere } from '@lib/types';
import snackbarUtils from '@lib/snackbar-utils';
import { MaterialUI } from '@front/layout';
import TaskComponent from '@front/components/tasks/task';
//#endregion

interface TaskPageProps {
  where: TkWhere;
  code: string;
}

const TaskPage: I18nPage<TaskPageProps> = ({ t, i18n, where, code, ...rest }): React.ReactElement => {
  const [files, setFiles] = useState<DropzoneFile[]>([]);
  const [comment, setComment] = useState<string>('');

  const {
    loading: loadingTicketsTask,
    data: dataTicketsTask,
    error: errorTicketsTask,
    refetch: taskRefetchInt,
    subscribeToMore: subscribeTicketsTask,
  } = useQuery<Data<'ticketsTask', TkEditTask>, { task: TkTaskInput }>(TICKETS_TASK, {
    ssr: true,
    variables: {
      task: {
        where: where || TkWhere.Default,
        code: code || '0',
      },
    },
    fetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    // TODO: when a subscription used, a fully object is transmitted to client, old too. try to minimize this.
    // const unsubscribe = subscribeTicketsTasks({
    subscribeTicketsTask({
      document: TICKETS_TASK_SUB,
      variables: {
        task: {
          where,
          code,
        },
      },
      updateQuery: (prev, { subscriptionData: { data } }) => {
        const updateData = data?.ticketsTask || [];

        return { ticketsTask: updateData };
      },
    });

    // return () => {
    //   unsubscribe();
    // };
  }, [subscribeTicketsTask, where, code]);

  const [getTaskFile, { loading: loadingTaskFile, data: dataTaskFile, error: errorTaskFile }] = useMutation<
    Data<'ticketsTaskFile', TkFile>,
    { file: TkFileInput }
  >(TICKETS_TASK_FILE);

  const [getCommentFile, { loading: loadingComment, data: dataCommentFile, error: errorCommentFile }] = useMutation<
    Data<'ticketsComment', TkFile>,
    { file: TkFileInput }
  >(TICKETS_COMMENT);

  const [TicketsTaskEdit, { loading: loadingEdit, error: errorEdit }] = useMutation<
    Data<'ticketsTaskEdit', TkEditTask>,
    { task: TkTaskEditInput }
  >(TICKETS_TASK_EDIT, {
    update(cache, { data: dataEdit }) {
      if (dataEdit) {
        cache.writeQuery({
          query: TICKETS_TASK,
          variables: {
            where: where || TkWhere.Default,
            code: code || '0',
          },
          data: { ticketsTask: dataEdit?.ticketsTaskEdit },
        });
      }
    },
  });

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

  const taskRefetch = (
    variables?: Partial<{
      task: TkTaskInput;
    }>,
  ): Promise<ApolloQueryResult<Data<'ticketsTask', TkEditTask>>> =>
    taskRefetchInt({ task: { where, code, ...variables?.task, cache: false } });

  const handleDownload = async (task: TkTask, file: TkFile): Promise<void> => {
    if (file.body) {
      download(file.body, file.name || '');
    } else if (task.where === TkWhere.SOAP1C && file.code) {
      getTaskFile({ variables: { file: { where: TkWhere.SOAP1C, code: file.code } } });
    }
  };

  const handleComment = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setComment(event.target.value);
  };

  const handleAccept = (): void => {
    const variables = {
      task: {
        where: where || TkWhere.Default,
        code: code || '0',
        comment,
        attachments: null,
        // attachments: files.map((file: DropzoneFile) => file.file),
      },
    };

    TicketsTaskEdit({
      variables,
    });

    setFiles([]);
    setComment('');
  };

  const handleClose = (): void => {
    setComment('');
    setFiles([]);
  };

  useEffect(() => {
    if (dataTaskFile) {
      download(dataTaskFile?.ticketsTaskFile.body || '', dataTaskFile?.ticketsTaskFile.name || '');
    }
  }, [dataTaskFile]);

  useEffect(() => {
    if (errorEdit) {
      snackbarUtils.error(errorEdit);
    }
    if (errorTicketsTask) {
      snackbarUtils.error(errorTicketsTask);
    }
    if (errorTaskFile) {
      snackbarUtils.error(errorTaskFile);
    }
    if (errorCommentFile) {
      snackbarUtils.error(errorCommentFile);
    }
  }, [errorEdit, errorTicketsTask, errorTaskFile, errorCommentFile]);

  const task = dataTicketsTask?.ticketsTask?.task ?? null;

  return (
    <>
      <Head>
        <title>
          {`${t('tasks:title')}: ${
            task
              ? t('tasks:task.header', {
                  ticket: task.code,
                  date: dateFormat(task.createdDate, i18n),
                })
              : ''
          }`}
        </title>
      </Head>
      <MaterialUI refetchComponent={taskRefetch} {...rest}>
        <TaskComponent
          loading={loadingTicketsTask}
          loadingTaskFile={loadingTaskFile}
          loadingComment={loadingComment}
          task={task}
          comment={comment}
          files={files}
          setFiles={setFiles}
          handleDownload={handleDownload}
          handleComment={handleComment}
          handleAccept={handleAccept}
          handleClose={handleClose}
        />
      </MaterialUI>
    </>
  );
};

TaskPage.getInitialProps = ({ query }) => {
  const code = query.code as string;
  const where = query.where as TkWhere;

  return {
    code,
    where,
    namespacesRequired: includeDefaultNamespaces(['tasks', 'phonebook']),
  };
};

export default nextI18next.withTranslation('tasks')(TaskPage);
