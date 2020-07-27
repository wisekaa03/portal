/** @format */

//#region Imports NPM
import React, { useEffect, useState } from 'react';
// import { useRouter } from 'next/router';
import Head from 'next/head';
import { useMutation, useLazyQuery } from '@apollo/client';
//#endregion
//#region Imports Local
import { includeDefaultNamespaces, nextI18next, I18nPage } from '@lib/i18n-client';
import {
  FILES_FOLDER_LIST,
  FOLDER_FILES_SUBSCRIPTION,
  FILES_GET_FILE,
  FILES_DELETE_FILE,
  FILES_DELETE_FOLDER,
} from '@lib/queries';
import { Data, FilesFile, FolderDialogState, DropzoneFile, FilesFolder, FilesPath } from '@lib/types';
import snackbarUtils from '@lib/snackbar-utils';
import { MaterialUI } from '@front/layout';
import FilesComponent from '@front/components/files';
import { useRouter } from 'next/router';
//#endregion

const thePathArray = (path: string): FilesPath[] =>
  path
    ?.split('/')
    .reduce((accumulator, element) => (element ? [...accumulator, element] : accumulator), [''] as FilesPath[]) || [''];

const FilesPage: I18nPage = ({ t, query, ...rest }): React.ReactElement => {
  const [attachments, setAttachments] = useState<DropzoneFile[]>([]);
  const [showDropzone, setShowDropzone] = useState<boolean>(false);
  const [openFolderDialog, setOpenFolderDialog] = useState<number>(0);
  const [folderDialog, setFolderDialog] = useState<FolderDialogState>({ pathname: '', name: '' });
  const [search, setSearch] = useState<string>('');
  const [path, setPath] = useState<FilesPath[]>(query?.path ? thePathArray(query.path) : ['']);
  const router = useRouter();

  const [
    getFolder,
    {
      data: dataFolderList,
      loading: loadingFolderList,
      error: errorFolderList,
      refetch: refetchFolderList,
      subscribeToMore: folderListSubscribe,
    },
  ] = useLazyQuery<Data<'folderFiles', FilesFolder[]>, { path: string }>(FILES_FOLDER_LIST, {
    // TODO: subscriptions
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });

  const [getFile, { error: errorGetFile }] = useMutation<
    Data<'getFile', FilesFile>,
    { path: string; options?: { sync?: boolean } }
  >(FILES_GET_FILE);

  const [deleteFile, { error: errorDeleteFile }] = useMutation<Data<'deleteFile', boolean>>(FILES_DELETE_FILE, {
    update(cache, fetch) {
      if (fetch?.data) {
        const query = cache.readQuery<Data<'folderFiles', FilesFolder[]>>({ query: FILES_FOLDER_LIST });
      }
    },
  });

  const [deleteFolder, { error: errorDeleteFolder }] = useMutation<Data<'deleteFile', boolean>>(FILES_DELETE_FOLDER, {
    update(cache, fetch) {
      if (fetch?.data) {
        const query = cache.readQuery<Data<'folderFiles', FilesFolder[]>>({ query: FILES_FOLDER_LIST });
      }
    },
  });

  useEffect(() => {
    if (getFolder) {
      const pathString = `${path.join('/')}/`;
      router.push(router.route, `${router.route}${pathString}`);
      getFolder({
        variables: {
          path: pathString,
        },
      });
    }
  }, [getFolder, path]);

  useEffect(() => {
    if (!loadingFolderList && folderListSubscribe) {
      const pathString = `${path.join('/')}/`;
      folderListSubscribe({
        document: FOLDER_FILES_SUBSCRIPTION,
        variables: { path: pathString },
      });
    }
  }, [loadingFolderList, folderListSubscribe, path]);

  useEffect(() => {
    if (errorFolderList) {
      path.pop();
      setPath(path || ['']);

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

  const folderRefetch = (): void => {
    if (refetchFolderList) {
      refetchFolderList({
        path: path.join('/'),
      });
    }
  };

  const handleFolder = (filesFolder: FilesFolder | string): void => {
    if (typeof filesFolder === 'string') {
      setPath(thePathArray(filesFolder));
    } else {
      setPath([...path, filesFolder.name]);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setSearch(event.currentTarget.value);
  };

  const handleCheckbox = (filesFolder?: FilesFolder) => (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ): void => {
    // eslint-disable-next-line no-debugger
    debugger;

    if (filesFolder) {
      handleFolder(filesFolder);
    }
  };

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

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const handleDrop = async (acceptedFiles: File[]): Promise<void> => {
    // eslint-disable-next-line no-debugger
    debugger;
  };

  return (
    <>
      <Head>
        <title>{t('files:title')}</title>
      </Head>
      <MaterialUI {...rest}>
        <FilesComponent
          folderLoading={loadingFolderList}
          folderData={dataFolderList?.folderFiles}
          folderRefetch={folderRefetch}
          search={search}
          path={path}
          handleCheckbox={handleCheckbox}
          handleDrop={handleDrop}
          handleFolder={handleFolder}
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

FilesPage.getInitialProps = ({ query }) => ({
  query,
  namespacesRequired: includeDefaultNamespaces(['files']),
});

export default nextI18next.withTranslation('files')(FilesPage);
