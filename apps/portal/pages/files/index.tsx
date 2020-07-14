/** @format */

//#region Imports NPM
import React, { useEffect, useState } from 'react';
// import { useRouter } from 'next/router';
import Head from 'next/head';
import { useMutation, useLazyQuery } from '@apollo/react-hooks';
//#endregion
//#region Imports Local
import { MaterialUI } from '@front/layout';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '@lib/i18n-client';
import { FILES_FOLDER_LIST, FILES_GET_FILE, FILES_DELETE_FILE, FILES_DELETE_FOLDER } from '@lib/queries';
import { Data, FilesQueryProps, FilesFile, FolderDialogState, DropzoneFile, FilesFolder } from '@lib/types';
import snackbarUtils from '@lib/snackbar-utils';
import FilesComponent from '@front/components/files';
//#endregion

const FilesPage: I18nPage = ({ t, ...rest }): React.ReactElement => {
  const [attachments, setAttachments] = useState<DropzoneFile[]>([]);
  const [showDropzone, setShowDropzone] = useState<boolean>(false);
  const [openFolderDialog, setOpenFolderDialog] = useState<number>(0);
  const [folderDialog, setFolderDialog] = useState<FolderDialogState>({ pathname: '', name: '' });
  const [search, setSearch] = useState<string>('');
  const [path, setPath] = useState<string>('/');

  const [
    getFolder,
    { data: dataFolderList, loading: loadingFolderList, error: errorFolderList, refetch: refetchFolderList },
  ] = useLazyQuery<Data<'folderFiles', FilesFolder[]>>(FILES_FOLDER_LIST);

  useEffect(() => {
    getFolder({
      variables: {
        value: { path },
      },
    });
  }, [path]);

  const [getFile, { error: errorGetFile }] = useMutation<
    Data<'getFile', FilesFile>,
    { path: string; options?: { sync?: boolean } }
  >(FILES_GET_FILE);

  const [deleteFile, { error: errorDeleteFile }] = useMutation<Data<'deleteFile', boolean>>(FILES_DELETE_FILE, {
    update(cache, fetch) {
      if (fetch?.data) {
        const query = cache.readQuery<Data<'folderFiles', FilesFolder[]>>({ query: FILES_FOLDER_LIST });
        // const data = query?.folder.filter((f) => f.id !== result);

        // if (data) {
        //   cache.writeQuery({
        //     query: FILES_FOLDER_LIST,
        //     data: { folder: data },
        //   });
        // }
      }
    },
  });

  const [deleteFolder, { error: errorDeleteFolder }] = useMutation<Data<'deleteFile', boolean>>(FILES_DELETE_FOLDER, {
    update(cache, fetch) {
      if (fetch?.data) {
        const query = cache.readQuery<Data<'folderFiles', FilesFolder[]>>({ query: FILES_FOLDER_LIST });
        // const data = query?.folder.filter((f) => f.id !== result);

        // if (data) {
        //   cache.writeQuery({
        //     query: FILES_FOLDER_LIST,
        //     data: { folder: data },
        //   });
        // }
      }
    },
  });

  /*
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

  const handleCloseDropzone = (): void => {
    setShowDropzone(false);
    setAttachments([]);
  };

  const handleFolderDialogName = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    setFolderDialog({ ...folderDialog, name: event.currentTarget.value });
  };

  const handleAcceptFolderDialog = (type: number): void => {
    if (type > 2) {
      deleteFolder({
        variables: { id: folderDialog.id },
      });
    } else {
      const pathname = `${folderDialog.pathname}/${folderDialog.name}`;

      editFolder({
        variables: {
          id: folderDialog.id,
          pathname,
          shared: pathname.startsWith(SHARED),
        },
      });
    }

    setOpenFolderDialog(0);
  };

  const handleCloseFolderDialog = (): void => {
    setOpenFolderDialog(0);
  };
 */

  useEffect(() => {
    if (errorFolderList) {
      snackbarUtils.error(errorFolderList);
    }
    if (errorDeleteFile) {
      snackbarUtils.error(errorDeleteFile);
    }
    if (errorDeleteFolder) {
      snackbarUtils.error(errorDeleteFolder);
    }
    if (errorGetFile) {
      snackbarUtils.error(errorGetFile);
    }
  }, [errorFolderList, errorDeleteFile, errorDeleteFolder, errorGetFile]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setSearch(event.currentTarget.value);
  };

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const handleDownload = (filesFolder: FilesFolder) => async (): Promise<void> => {
    const download = await getFile({ variables: { path: `${path}${filesFolder.name}`, options: { sync: true } } });
    const downloadURL = `${document.location.origin}/${download.data?.getFile.path}`;

    const link = document.createElement('a');
    link.href = downloadURL;
    link.setAttribute('download', filesFolder.name);
    document.body.append(link);
    link.click();
    link.remove();
  };

  const handleDelete = (filesFolder: FilesFolder) => (): void => {
    if (filesFolder.type === 'FOLDER') {
      deleteFolder({ variables: { id: filesFolder.id } });
    } else {
      deleteFile({ variables: { id: filesFolder.id } });
    }
  };

  return (
    <>
      <Head>
        <title>{t('files:title')}</title>
      </Head>
      <MaterialUI {...rest}>
        <FilesComponent
          setPath={setPath}
          folderLoading={loadingFolderList}
          folderData={dataFolderList?.folderFiles}
          folderRefetch={refetchFolderList}
          search={search}
          handleSearch={handleSearch}
          handleDownload={handleDownload}
          handleDelete={handleDelete}
          // setFolderName={setFolderName}
          // showDropzone={showDropzone}
          // handleOpenDropzone={handleOpenDropzone}
          // handleCloseDropzone={handleCloseDropzone}
          // handleEditFolder={handleEditFolder}
          // handleAcceptFolderDialog={handleAcceptFolderDialog}
          // handleCloseFolderDialog={handleCloseFolderDialog}
          // openFolderDialog={openFolderDialog}
          // folderDialogName={folderDialog.name}
          // handleFolderDialogName={handleFolderDialogName}
          // attachments={attachments}
          // setAttachments={setAttachments}
          // search={search}
        />
      </MaterialUI>
    </>
  );
};

FilesPage.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['files']),
});

export default nextI18next.withTranslation('files')(FilesPage);
