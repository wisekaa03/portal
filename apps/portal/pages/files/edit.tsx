/** @format */

// #region Imports NPM
import React, { useEffect, useState } from 'react';
import { QueryResult } from 'react-apollo';
import { useMutation, useLazyQuery, useQuery } from '@apollo/react-hooks';
import Head from 'next/head';
// #endregion
// #region Imports Local
import Page from '../../layouts/main';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '../../lib/i18n-client';
import { EDIT_FILE, FILE, FOLDER, EDIT_FOLDER } from '../../lib/queries';
import { Files } from '../../src/files/models/files.dto';
import { DropzoneFile } from '../../components/dropzone/types';
import { Data } from '../../lib/types';
import snackbarUtils from '../../lib/snackbar-utils';
import FilesEditComponent from '../../components/files/edit';
import { FilesFolder } from '../../src/files/models/files.folder.dto';
// #endregion

const FilesEditPage: I18nPage = ({ t, query, ...rest }): React.ReactElement => {
  const [current, setCurrent] = useState<Files | undefined>();
  const [folder, setFolder] = useState<string>('/');
  const [attachments, setAttachments] = useState<DropzoneFile[]>([]);

  const { data: folderData, loading: folderLoading, error: folderError }: QueryResult<Data<'Folder', any>> = useQuery(
    FOLDER,
  );
  const [getFile, { loading, error, data }] = useLazyQuery(FILE);

  const [editFile] = useMutation(EDIT_FILE);
  const [editFolder] = useMutation(EDIT_FOLDER);

  const handleUpload = (): void => {
    attachments.forEach((file: DropzoneFile) => {
      editFile({
        variables: {
          // ...updated,
          attachment: file.file,
          folder,
        },
      });
    });
  };

  const handleCreateFolder = (pathname: string): void => {
    editFolder({
      refetchQueries: [{ query: FOLDER }],
      variables: { pathname },
    });
  };

  useEffect(() => {
    if (query.id) {
      const { id } = query;

      getFile({
        variables: { id },
      });
      // setUpdated({ id } as any);
    } else {
      setCurrent(undefined);
    }
  }, [getFile, query]);

  useEffect(() => {
    if (!loading && !error && data?.media) {
      setCurrent(data.media);
    }
  }, [loading, data, error]);

  useEffect(() => {
    if (error) {
      snackbarUtils.error(error);
    }
    if (folderError) {
      snackbarUtils.error(folderError);
    }
  }, [error, folderError]);

  return (
    <>
      <Head>
        <title>{t(`media:title`)}</title>
      </Head>
      <Page {...rest}>
        <FilesEditComponent
          loading={loading}
          foldersLoading={folderLoading}
          folderData={folderData?.folder}
          handleCreateFolder={handleCreateFolder}
          current={current}
          folder={folder}
          setFolder={setFolder}
          attachments={attachments}
          setAttachments={setAttachments}
          handleUpload={handleUpload}
        />
      </Page>
    </>
  );
};

FilesEditPage.getInitialProps = ({ query }) => ({
  query,
  namespacesRequired: includeDefaultNamespaces(['media']),
});

export default nextI18next.withTranslation('media')(FilesEditPage);