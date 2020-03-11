/** @format */

// #region Imports NPM
import React, { useEffect, useState } from 'react';
// import { useRouter } from 'next/router';
import Head from 'next/head';
import { QueryResult } from 'react-apollo';
import { useQuery, useMutation } from '@apollo/react-hooks';
// #endregion
// #region Imports Local
import Page from '../../layouts/main';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '../../lib/i18n-client';
import { FILE, EDIT_FILE, DELETE_FILE, EDIT_FOLDER, FOLDER, DELETE_FOLDER } from '../../lib/queries';
// import { ProfileContext } from '../../lib/context';
import { Data } from '../../lib/types';
import { FilesQueryProps, FolderDialogState } from '../../components/files/types';
import FilesComponent from '../../components/files';
import snackbarUtils from '../../lib/snackbar-utils';
import { DropzoneFile } from '../../components/dropzone/types';
import { FILES_SHARED_NAME } from '../../lib/constants';
// #endregion

const FilesPage: I18nPage = ({ t, ...rest }): React.ReactElement => {
  const [folderName, setFolderName] = useState<string>('/');
  const [attachments, setAttachments] = useState<DropzoneFile[]>([]);
  const [showDropzone, setShowDropzone] = useState<boolean>(false);
  const [openFolderDialog, setOpenFolderDialog] = useState<number>(0);
  const [folderDialog, setFolderDialog] = useState<FolderDialogState>({ pathname: '', name: '' });

  const {
    data: fileData,
    loading: fileLoading,
    error: fileError,
  }: QueryResult<Data<'file', FilesQueryProps[]>> = useQuery(FILE, {
    fetchPolicy: 'no-cache',
  });

  const { data: folderData, loading: folderLoading, error: folderError }: QueryResult<Data<'folder', any>> = useQuery(
    FOLDER,
  );

  const [editFolder] = useMutation(EDIT_FOLDER);
  const [deleteFolder] = useMutation(DELETE_FOLDER);

  const handleEditFolder = (pathname: string, type: number, id?: string): void => {
    if (type > 1 && id) {
      const folders = pathname.split('/');
      setFolderDialog({ id, pathname, name: folders[folders.length - 1] });
    } else {
      setFolderDialog({ pathname, name: '' });
    }

    setOpenFolderDialog(type);
  };

  const [uploadFile] = useMutation(EDIT_FILE);

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

  const handleOpenDropzone = (): void => {
    setShowDropzone(true);
  };

  const handleFolderDialogName = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    setFolderDialog({ ...folderDialog, name: event.currentTarget.value });
  };

  const handleAcceptFolderDialog = (type: number): void => {
    if (type > 2) {
      deleteFolder({
        refetchQueries: [{ query: FOLDER }],
        variables: { id: folderDialog.id },
      });
    } else {
      editFolder({
        refetchQueries: [{ query: FOLDER }],
        variables: {
          id: folderDialog.id,
          pathname: folderDialog.pathname,
          shared: folderDialog.pathname.startsWith(`/${FILES_SHARED_NAME}`),
        },
      });
    }
  };

  const handleCloseFolderDialog = (): void => {
    setOpenFolderDialog(0);
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
        <title>{t('files:title')}</title>
      </Head>
      <Page {...rest}>
        <FilesComponent
          fileLoading={fileLoading}
          folderLoading={folderLoading}
          fileData={fileData?.file}
          folderData={folderData?.folder}
          folderName={folderName}
          setFolderName={setFolderName}
          showDropzone={showDropzone}
          handleOpenDropzone={handleOpenDropzone}
          handleEditFolder={handleEditFolder}
          handleAcceptFolderDialog={handleAcceptFolderDialog}
          handleCloseFolderDialog={handleCloseFolderDialog}
          openFolderDialog={openFolderDialog}
          folderDialogName={folderDialog.name}
          handleFolderDialogName={handleFolderDialogName}
          attachments={attachments}
          setAttachments={setAttachments}
          handleUploadFile={handleUploadFile}
        />
      </Page>
    </>
  );
};

FilesPage.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['files']),
});

export default nextI18next.withTranslation('files')(FilesPage);
