/** @format */

// #region Imports NPM
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { QueryResult } from 'react-apollo';
import { useQuery, useMutation } from '@apollo/react-hooks';
// #endregion
// #region Imports Local
import Page from '../../layouts/main';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '../../lib/i18n-client';
import { FILE, EDIT_FILE, DELETE_FILE, EDIT_FOLDER, FOLDER } from '../../lib/queries';
// import { ProfileContext } from '../../lib/context';
import { Data } from '../../lib/types';
import { FileQueryProps } from '../../components/media/types';
import MediaComponent from '../../components/media';
import snackbarUtils from '../../lib/snackbar-utils';
import { DropzoneFile } from '../../components/dropzone/types';
// #endregion

const MediaPage: I18nPage = ({ t, ...rest }): React.ReactElement => {
  const [folderName, setFolderName] = useState<string>('/');
  const [attachments, setAttachments] = useState<DropzoneFile[]>([]);

  const {
    data: fileData,
    loading: fileLoading,
    error: fileError,
  }: QueryResult<Data<'file', FileQueryProps[]>> = useQuery(FILE, {
    // ssr: false,
    fetchPolicy: 'cache-first',
  });

  const { data: folderData, loading: folderLoading, error: folderError }: QueryResult<Data<'folder', any>> = useQuery(
    FOLDER,
  );

  const [createFolder] = useMutation(EDIT_FOLDER);
  const [uploadFile] = useMutation(EDIT_FILE);

  const handleCreateFolder = (pathname: string): void => {
    createFolder({
      refetchQueries: [{ query: FOLDER }],
      variables: { pathname },
    });
  };

  const handleUploadFile = (): void => {
    attachments.forEach((file: DropzoneFile) => {
      uploadFile({
        variables: {
          // ...updated,
          attachment: file.file,
          folder: folderName,
        },
      });
    });
  };

  // const [current, setCurrent] = useState<FileQueryProps | undefined>();
  // const profile = useContext(ProfileContext);
  // const router = useRouter();
  // const mediaId = router && router.query && router.query.id;

  // const handleCurrent = (media: FileQueryProps) => (): void => {
  //   setCurrent(media);
  // };

  // const [deleteMedia] = useMutation(DELETE_FILE, {
  //   refetchQueries: [
  //     {
  //       query: FILE,
  //     },
  //   ],
  //   awaitRefetchQueries: true,
  // });

  // const handleDelete = (media: FileQueryProps) => (): void => {
  //   if (media && media.id) {
  //     deleteMedia({ variables: { id: media.id } });
  //   }
  // };

  // const handleCloseCurrent = (): void => {
  //   setCurrent(null);
  // };

  useEffect(() => {
    if (fileError) {
      snackbarUtils.error(fileError);
    }
    if (folderError) {
      snackbarUtils.error(folderError);
    }
  }, [fileError, folderError]);

  return (
    <>
      <Head>
        <title>{t('media:title')}</title>
      </Head>
      <Page {...rest}>
        <MediaComponent
          fileLoading={fileLoading}
          folderLoading={folderLoading}
          fileData={fileData?.file}
          folderData={folderData?.folder}
          folderName={folderName}
          setFolderName={setFolderName}
          handleCreateFolder={handleCreateFolder}
          attachments={attachments}
          setAttachments={setAttachments}
          handleUploadFile={handleUploadFile}
        />
      </Page>
    </>
  );
};

MediaPage.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['media']),
});

export default nextI18next.withTranslation('news')(MediaPage);
