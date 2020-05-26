/** @format */
/* eslint import/no-default-export: 0 */

//#region Imports NPM
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { QueryResult } from 'react-apollo';
import { useQuery, useMutation } from '@apollo/react-hooks';
//#endregion
//#region Imports Local
import { format } from '@lib/dayjs';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '@lib/i18n-client';
import { TICKETS_TASK_DESCRIPTION, TICKETS_TASK_EDIT } from '@lib/queries';
import { Data, TkTask, DropzoneFile } from '@lib/types';
import snackbarUtils from '@lib/snackbar-utils';
import { MaterialUI } from '@front/layout';
import ProfileTicketComponent from '@front/components/profile/ticket';
//#endregion

const ProfileTicketPage: I18nPage = ({ t, i18n, query, ...rest }): React.ReactElement => {
  const [files, setFiles] = useState<DropzoneFile[]>([]);
  const [comment, setComment] = useState<string>('');

  const { loading, data, error }: QueryResult<Data<'TicketsTaskDescription', TkTask>> = useQuery(
    TICKETS_TASK_DESCRIPTION,
    {
      ssr: false,
      variables: {
        code: query.id,
        type: query.type,
      },
      fetchPolicy: 'cache-and-network',
    },
  );

  const [oldTicketEdit, { loading: loadingEdit, error: errorEdit }] = useMutation(TICKETS_TASK_EDIT, {
    update(cache, { data: { OldTicketEdit } }) {
      cache.writeQuery({
        query: TICKETS_TASK_DESCRIPTION,
        variables: {
          code: query.id,
          type: query.type,
        },
        data: { OldTicketDescription: OldTicketEdit },
      });
    },
  });

  const handleComment = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setComment(event.target.value);
  };

  const handleAccept = (): void => {
    const variables = {
      ticket: {
        code: query.id,
        type: query.type,
        comment,
      },
      attachments: files.map((file: DropzoneFile) => file.file),
    };

    oldTicketEdit({
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
                  ticket: task.code,
                  date: format(task.createdDate, i18n),
                })
              : ''
          }`}
        </title>
      </Head>
      <MaterialUI {...rest}>
        <ProfileTicketComponent
          loading={loading}
          loadingEdit={loadingEdit}
          task={task}
          comment={comment}
          files={files}
          setFiles={setFiles}
          handleComment={handleComment}
          handleAccept={handleAccept}
          handleClose={handleClose}
        />
      </MaterialUI>
    </>
  );
};

ProfileTicketPage.getInitialProps = ({ query }) => {
  const { id, type } = query;

  return {
    query: { id, type },
    namespacesRequired: includeDefaultNamespaces(['profile', 'phonebook']),
  };
};

export default nextI18next.withTranslation('profile')(ProfileTicketPage);
