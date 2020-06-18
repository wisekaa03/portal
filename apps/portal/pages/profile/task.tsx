/** @format */

//#region Imports NPM
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { QueryResult } from 'react-apollo';
import { useQuery, useMutation, useLazyQuery } from '@apollo/react-hooks';
//#endregion
//#region Imports Local
import { format } from '@lib/dayjs';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '@lib/i18n-client';
import { TICKETS_TASK_DESCRIPTION, TICKETS_TASK_EDIT, TICKETS_TASK_FILE, TICKETS_COMMENT_FILE } from '@lib/queries';
import { Data, TkWhere, TkEditTask, TkFileInput, TkFile, DropzoneFile } from '@lib/types';
import snackbarUtils from '@lib/snackbar-utils';
import { MaterialUI } from '@front/layout';
import ProfileTaskComponent from '@front/components/profile/task';
//#endregion

const ProfileTaskPage: I18nPage = ({ t, i18n, query, ...rest }): React.ReactElement => {
  const [files, setFiles] = useState<DropzoneFile[]>([]);
  const [comment, setComment] = useState<string>('');

  const { loading, data, error }: QueryResult<Data<'TicketsTaskDescription', TkEditTask>> = useQuery(
    TICKETS_TASK_DESCRIPTION,
    {
      ssr: false,
      variables: {
        where: query?.where || TkWhere.Default,
        code: query?.code || '0',
      },
      fetchPolicy: 'cache-and-network',
    },
  );

  const [getTaskFile, { loading: taskFileLoading, data: taskFileData, error: taskFileError }] = useLazyQuery<
    Data<'TicketsTaskFile', TkFile>,
    TkFileInput
  >(TICKETS_TASK_FILE, { ssr: false });

  const [
    getCommentFile,
    { loading: commentFileLoading, data: commentFileData, error: commentFileError },
  ] = useLazyQuery<Data<'TicketsCommentFile', TkFile>, TkFileInput>(TICKETS_COMMENT_FILE, { ssr: false });

  const [TicketsTaskEdit, { loading: loadingEdit, error: errorEdit }] = useMutation(TICKETS_TASK_EDIT, {
    update(cache, { data: { TicketsTaskEdit } }) {
      cache.writeQuery({
        query: TICKETS_TASK_DESCRIPTION,
        variables: {
          where: query?.where || TkWhere.Default,
          code: query?.code || '0',
        },
        data: { TicketsTaskDescription: TicketsTaskEdit },
      });
    },
  });

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
          {`${t('profile:title')}: ${
            task
              ? t('profile:ticket.header', {
                  ticket: task.task?.code,
                  date: task.task?.createdDate ? format(task.task?.createdDate, i18n) : null,
                })
              : ''
          }`}
        </title>
      </Head>
      <MaterialUI {...rest}>
        {task?.task && (
          <ProfileTaskComponent
            loading={loading}
            loadingEdit={loadingEdit}
            task={task.task}
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
            handleComment={handleComment}
            handleAccept={handleAccept}
            handleClose={handleClose}
          />
        )}
      </MaterialUI>
    </>
  );
};

ProfileTaskPage.getInitialProps = ({ query }) => {
  const { code, where } = query;

  return {
    query: { code, where },
    namespacesRequired: includeDefaultNamespaces(['profile', 'phonebook']),
  };
};

export default nextI18next.withTranslation('profile')(ProfileTaskPage);
