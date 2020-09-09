/** @format */
/* eslint no-use-before-define:0 */

//#region Imports NPM
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useQuery, useMutation, useLazyQuery, QueryResult } from '@apollo/client';
//#endregion
//#region Imports Local
import dateFormat from '@lib/date-format';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '@lib/i18n-client';
import { TICKETS_TASK_DESCRIPTION, TICKETS_TASK_EDIT, TICKETS_TASK_FILE, TICKETS_COMMENT_FILE } from '@lib/queries';
import type { Data, TkTask, TkEditTask, TkFileInput, TkFile, DropzoneFile } from '@lib/types';
import { TkWhere } from '@lib/types';
import snackbarUtils from '@lib/snackbar-utils';
import { MaterialUI } from '@front/layout';
import TaskComponent from '@front/components/tasks/task';
//#endregion

const TaskPage: I18nPage = ({ t, i18n, query, ...rest }): React.ReactElement => {
  const [files, setFiles] = useState<DropzoneFile[]>([]);
  const [comment, setComment] = useState<string>('');

  const { loading, data, error, refetch: taskRefetch }: QueryResult<Data<'TicketsTaskDescription', TkEditTask>> = useQuery(
    TICKETS_TASK_DESCRIPTION,
    {
      ssr: false,
      variables: {
        where: query?.where || TkWhere.Default,
        code: query?.code || '0',
      },
      fetchPolicy: 'cache-first',
      notifyOnNetworkStatusChange: true,
    },
  );

  const [getTaskFile, { loading: loadingTaskFile, data: dataTaskFile, error: errorTaskFile }] = useLazyQuery<
    Data<'TicketsTaskFile', TkFile>,
    { file: TkFileInput }
  >(TICKETS_TASK_FILE, { ssr: false });

  const [getCommentFile, { loading: loadingCommentFile, data: dataCommentFile, error: errorCommentFile }] = useLazyQuery<
    Data<'TicketsCommentFile', TkFile>,
    { file: TkFileInput }
  >(TICKETS_COMMENT_FILE, { ssr: false });

  const [TicketsTaskEdit, { loading: loadingEdit, error: errorEdit }] = useMutation(TICKETS_TASK_EDIT, {
    update(cache, { data: { TicketsTaskEdit: TicketsTaskEditUpdate } }) {
      cache.writeQuery({
        query: TICKETS_TASK_DESCRIPTION,
        variables: {
          where: query?.where || TkWhere.Default,
          code: query?.code || '0',
        },
        data: { TicketsTaskDescription: TicketsTaskEditUpdate },
      });
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

  const handleDownload = async (task: TkTask, file: TkFile): Promise<void> => {
    if (file.body) {
      download(file.body, file.name || '');
    } else if (task.where === TkWhere.SOAP1C && file.id) {
      getTaskFile({ variables: { file: { where: TkWhere.SOAP1C, id: file.id } } });
    }
  };

  const handleComment = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setComment(event.target.value);
  };

  const handleAccept = (): void => {
    const variables = {
      where: query?.where || TkWhere.Default,
      code: query?.id || '0',
      comment,
      attachments: files.map((file: DropzoneFile) => file.file),
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
      download(dataTaskFile?.TicketsTaskFile.body || '', dataTaskFile?.TicketsTaskFile.name || '');
    }
  }, [dataTaskFile]);

  useEffect(() => {
    if (errorEdit) {
      snackbarUtils.error(errorEdit);
    }
    if (error) {
      snackbarUtils.error(error);
    }
    if (errorTaskFile) {
      snackbarUtils.error(errorTaskFile);
    }
    if (errorCommentFile) {
      snackbarUtils.error(errorCommentFile);
    }
  }, [errorEdit, error, errorTaskFile, errorCommentFile]);

  const task = data?.TicketsTaskDescription;

  return (
    <>
      <Head>
        <title>
          {`${t('tasks:title')}: ${
            task
              ? t('tasks:task.header', {
                  ticket: task.task?.code,
                  date: dateFormat(task.task?.createdDate, i18n),
                })
              : ''
          }`}
        </title>
      </Head>
      <MaterialUI {...rest}>
        <TaskComponent
          loading={loading}
          loadingTaskFile={loadingTaskFile}
          loadingCommentFile={loadingCommentFile}
          taskRefetch={taskRefetch}
          task={task?.task}
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
  const { code, where } = query;

  return {
    query: { code, where },
    namespacesRequired: includeDefaultNamespaces(['tasks', 'phonebook']),
  };
};

export default nextI18next.withTranslation('tasks')(TaskPage);
