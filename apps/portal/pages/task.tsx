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
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
    },
  );

  const [getTaskFile, { loading: taskFileLoading, data: taskFileData, error: taskFileError }] = useLazyQuery<
    Data<'TicketsTaskFile', TkFile>,
    TkFileInput
  >(TICKETS_TASK_FILE, { ssr: false });

  const [getCommentFile, { loading: commentFileLoading, data: commentFileData, error: commentFileError }] = useLazyQuery<
    Data<'TicketsCommentFile', TkFile>,
    TkFileInput
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

  const handleDownload = (task: TkTask, file: TkFile): void => {
    // eslint-disable-next-line no-debugger
    debugger;
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
    if (errorEdit) {
      snackbarUtils.error(errorEdit);
    }
    if (error) {
      snackbarUtils.error(error);
    }
  }, [errorEdit, error]);

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
          loadingEdit={loadingEdit}
          taskRefetch={taskRefetch}
          task={task?.task}
          comment={comment}
          files={files}
          setFiles={setFiles}
          taskFile={getTaskFile}
          taskFileLoading={taskFileLoading}
          taskFileData={taskFileData}
          taskFileError={taskFileError}
          commentFile={getCommentFile}
          commentFileLoading={commentFileLoading}
          commentFileData={commentFileData}
          commentFileError={commentFileError}
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
