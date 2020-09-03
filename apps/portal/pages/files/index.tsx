/** @format */

//#region Imports NPM
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useMutation, useLazyQuery } from '@apollo/client';
//#endregion
//#region Imports Local
import type { Data, FilesFile, FilesFolder, FilesPath, FilesFolderChk } from '@lib/types';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '@lib/i18n-client';
import {
  FILES_FOLDER_LIST,
  FOLDER_FILES_SUBSCRIPTION,
  FILES_GET_FILE,
  FILES_DELETE_FILE,
  FILES_DELETE_FOLDER,
  FILES_PUT_FILE,
} from '@lib/queries';
import snackbarUtils from '@lib/snackbar-utils';
import { MaterialUI } from '@front/layout';
import FilesComponent from '@front/components/files';
//#endregion

const handleUrl = () => {
  window.open('https://cloud.kube.i-npz.ru', '_blank');
};

const thePathArray = (path: string): FilesPath[] =>
  path?.split('/').reduce((accumulator, element) => (element ? [...accumulator, element] : accumulator), [''] as FilesPath[]) || [''];

const FilesPage: I18nPage = ({ t, query, ...rest }): React.ReactElement => {
  // const [attachments, setAttachments] = useState<DropzoneFile[]>([]);
  // const [showDropzone, setShowDropzone] = useState<boolean>(false);
  // const [openFolderDialog, setOpenFolderDialog] = useState<number>(0);
  // const [folderDialog, setFolderDialog] = useState<FolderDialogState>({ pathname: '', name: '' });
  const [search, setSearch] = useState<string>('');
  const [filesFolder, setFilesFolder] = useState<FilesFolderChk[]>([]);
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

  const [getFile, { error: errorGetFile }] = useMutation<Data<'getFile', FilesFile>, { path: string; options?: { sync?: boolean } }>(
    FILES_GET_FILE,
  );

  const [putFile, { error: errorPutFile }] = useMutation<Data<'putFile', boolean>, { path: string; file: File }>(FILES_PUT_FILE);

  const [deleteFile, { error: errorDeleteFile }] = useMutation<Data<'deleteFile', boolean>>(FILES_DELETE_FILE, {
    update(cache, fetch) {
      if (fetch?.data) {
        // const query = cache.readQuery<Data<'folderFiles', FilesFolder[]>>({ query: FILES_FOLDER_LIST });
      }
    },
  });

  const [deleteFolder, { error: errorDeleteFolder }] = useMutation<Data<'deleteFile', boolean>>(FILES_DELETE_FOLDER, {
    update(cache, fetch) {
      if (fetch?.data) {
        // const query = cache.readQuery<Data<'folderFiles', FilesFolder[]>>({ query: FILES_FOLDER_LIST });
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
  }, [getFolder, path, router]);

  useEffect(() => {
    if (!loadingFolderList && folderListSubscribe) {
      const pathString = `${path.join('/')}/`;
      // folderListSubscribe({
      //   document: FOLDER_FILES_SUBSCRIPTION,
      //   variables: { path: pathString },
      // });
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
  }, [errorFolderList, errorDeleteFile, errorDeleteFolder, errorGetFile, path]);

  const folderRefetch = (): void => {
    if (refetchFolderList) {
      refetchFolderList({
        path: path.join('/'),
      });
    }
  };

  const handleFolder = (folder: FilesFolder | string): void => {
    if (typeof folder === 'string') {
      setPath(thePathArray(folder));
    } else {
      setPath([...path, folder.name]);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setSearch(event.currentTarget.value);
  };

  const handleCheckbox = (ff: number | FilesFolderChk[]) => (event: React.ChangeEvent<HTMLInputElement>, checked: boolean): void => {
    if (Array.isArray(ff)) {
      setFilesFolder(filesFolder.map((element) => ({ ...element, checked })));
    } else {
      filesFolder[ff].checked = checked;
      setFilesFolder(filesFolder);
    }
  };

  const handleDownload = (folder: FilesFolder) => async (): Promise<void> => {
    const download = await getFile({ variables: { path: `${path}${folder.name}`, options: { sync: true } } });
    const downloadURL = `${document.location.origin}/${download.data?.getFile.path}`;

    const link = document.createElement('a');
    link.href = downloadURL;
    link.setAttribute('download', folder.name);
    document.body.append(link);
    link.click();
    link.remove();
  };

  const handleUpload = (): void => {
    try {
      const putFileHandler = (event: Event) => {
        const srcElement = (event?.srcElement as HTMLInputElement)?.files;
        if (srcElement?.length) {
          for (let i = 0; i < srcElement.length; i += 1) {
            const file = srcElement.item(i);
            if (file) {
              putFile({ variables: { path: `${path.join('/')}/${file.name}`, file } });
            } else {
              console.log(`File: ${file} is not read`);
            }
          }
        }
      };

      const input = document.createElement('input');
      input.style.visibility = 'hidden';
      input.type = 'file';
      input.multiple = true;
      input.id = 'upload';
      input.addEventListener('change', putFileHandler, false);
      input.click();
      document.body.append(input);
      input.remove();
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = (folder?: FilesFolder) => (): void => {
    if (folder) {
      if (folder.type === 'FOLDER') {
        deleteFolder({ variables: { id: folder.id } });
      } else {
        deleteFile({ variables: { id: folder.id } });
      }
    }
  };

  const handleDrop = async (acceptedFiles: File[]): Promise<void> => {
    // eslint-disable-next-line no-debugger
    debugger;
  };

  useEffect(() => {
    const state =
      dataFolderList && Array.isArray(dataFolderList.folderFiles)
        ? dataFolderList.folderFiles.map((element) => ({ ...element, checked: false }))
        : [];
    if (state) {
      setFilesFolder(state);
    }
  }, [dataFolderList, setFilesFolder]);

  return (
    <>
      <Head>
        <title>{t('files:title')}</title>
      </Head>
      <MaterialUI {...rest}>
        <FilesComponent
          folderLoading={loadingFolderList}
          folderData={filesFolder}
          folderRefetch={folderRefetch}
          search={search}
          path={path}
          handleCheckbox={handleCheckbox}
          handleDrop={handleDrop}
          handleFolder={handleFolder}
          handleSearch={handleSearch}
          handleDownload={handleDownload}
          handleUpload={handleUpload}
          handleDelete={handleDelete}
          handleUrl={handleUrl}
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
