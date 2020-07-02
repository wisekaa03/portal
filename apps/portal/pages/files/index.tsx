/** @format */

//#region Imports NPM
import React, { useEffect, useState } from 'react';
// import { useRouter } from 'next/router';
import Head from 'next/head';
import { QueryResult } from 'react-apollo';
import { useQuery, useMutation, useLazyQuery } from '@apollo/react-hooks';
//#endregion
//#region Imports Local
import { MaterialUI } from '@front/layout';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '@lib/i18n-client';
import { FOLDER_FILES, EDIT_FILE, DELETE_FILE, EDIT_FOLDER, DELETE_FOLDER } from '@lib/queries';
import { Data, FilesQueryProps, FolderDialogState, DropzoneFile, FilesFolder } from '@lib/types';
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
    { data: folderData, loading: folderLoading, error: folderError, refetch: folderRefetch },
  ] = useLazyQuery<Data<'folderFiles', FilesFolder[]>>(FOLDER_FILES);

  useEffect(() => {
    getFolder({
      variables: {
        value: { path },
      },
    });
  }, [path]);
  /*   const [editFolder] = useMutation(EDIT_FOLDER, {
    update(cache, { data: { editFolder: result } }) {
      const query = cache.readQuery<any>({ query: FOLDER_FILES });
      const data = query?.folder.filter((f) => f.id !== result.id);

      if (data) {
        cache.writeQuery({
          query: FOLDER_FILES,
          data: { folder: [...data, result] },
        });
      }
    },
  });
  const [deleteFolder] = useMutation(DELETE_FOLDER, {
    update(cache, { data: { deleteFolder: result } }) {
      const query = cache.readQuery<any>({ query: FOLDER });
      const data = query?.folder.filter((f) => f.id !== result);

      if (data) {
        cache.writeQuery({
          query: FOLDER,
          data: { folder: data },
        });
      }
    },
  });

  const handleEditFolder = (pathname: string, type: number, id?: string): void => {
    if (type > 1 && id) {
      const folders = pathname.split('/').filter((f) => !!f);
      const oldName = folders[folders.length - 1];
      folders.pop();
      const newPathname = `/${folders.join('/')}`;

      setFolderDialog({ id, pathname: newPathname, oldName, name: oldName });
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

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setSearch(event.currentTarget.value);
  };

  const handleDownload = (): void => {
    // /
  };

  const handleDelete = (): void => {
    // /
  };
 */

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
    if (folderError) {
      snackbarUtils.error(folderError);
    }
  }, [folderError]);

  return (
    <>
      <Head>
        <title>{t('files:title')}</title>
      </Head>
      <MaterialUI {...rest}>
        <FilesComponent
          folderLoading={folderLoading}
          folderData={folderData?.folderFiles}
          setPath={setPath}
          // setFolderName={setFolderName}
          // fileRefetch={fileRefetch}
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
          // handleUploadFile={handleUploadFile}
          // search={search}
          // handleSearch={handleSearch}
          // handleDownload={handleDownload}
          // handleDelete={handleDelete}
        />
      </MaterialUI>
    </>
  );
};

FilesPage.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['files']),
});

export default nextI18next.withTranslation('files')(FilesPage);
