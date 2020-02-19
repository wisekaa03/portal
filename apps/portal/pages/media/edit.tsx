/** @format */

// #region Imports NPM
import React, { useEffect, useState } from 'react';
import { QueryResult } from 'react-apollo';
import { useMutation, useLazyQuery, useQuery } from '@apollo/react-hooks';
import Head from 'next/head';
import { useRouter } from 'next/router';
// #endregion
// #region Imports Local
import Page from '../../layouts/main';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '../../lib/i18n-client';
import { MEDIA_EDIT, MEDIA, FOLDERS } from '../../lib/queries';
import { Media } from '../../src/media/models/media.dto';
import { DropzoneFile } from '../../components/dropzone/types';
import { Data } from '../../lib/types';
import snackbarUtils from '../../lib/snackbar-utils';
import MediaEditComponent from '../../components/media/edit';
// #endregion

const MediaEdit: I18nPage = ({ t, ...rest }): React.ReactElement => {
  const [current, setCurrent] = useState<Media | undefined>();
  const [updated, setUpdated] = useState<Media | undefined>();
  const [attachments, setAttachments] = useState<DropzoneFile[]>([]);
  const router = useRouter();

  const {
    data: foldersData,
    loading: foldersLoading,
    error: foldersError,
  }: QueryResult<Data<'Folders', any>> = useQuery(FOLDERS, { ssr: false });
  const [getMedia, { loading, error, data }] = useLazyQuery(MEDIA, { ssr: false });
  const [mediaEdit] = useMutation(MEDIA_EDIT);

  console.log(foldersData);

  const handleUpload = (): void => {
    attachments.forEach((file: DropzoneFile) => {
      mediaEdit({
        variables: {
          ...updated,
          attachment: file.file,
        },
      });
    });
  };

  useEffect(() => {
    if (router && router.query && router.query.id) {
      const id = router.query.id as string;
      getMedia({
        variables: { id },
      });
      setUpdated({ id } as any);
    } else {
      setCurrent(undefined);
    }
  }, [getMedia, router]);

  useEffect(() => {
    if (!loading && !error && data?.media) {
      setCurrent(data.media);
    }
  }, [loading, data, error]);

  useEffect(() => {
    if (error) {
      snackbarUtils.error(error);
    }
    if (foldersError) {
      snackbarUtils.error(foldersError);
    }
  }, [error, foldersError]);

  return (
    <>
      <Head>
        <title>{t(`media:title`)}</title>
      </Head>
      <Page {...rest}>
        <MediaEditComponent
          loading={loading}
          foldersLoading={foldersLoading}
          current={current}
          attachments={attachments}
          setAttachments={setAttachments}
          handleUpload={handleUpload}
        />
      </Page>
    </>
  );
};

MediaEdit.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['media']),
});

export default nextI18next.withTranslation('media')(MediaEdit);
