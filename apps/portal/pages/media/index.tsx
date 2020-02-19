/** @format */

// #region Imports NPM
import React, { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { QueryResult } from 'react-apollo';
import { useQuery, useMutation } from '@apollo/react-hooks';
// #endregion
// #region Imports Local
import Page from '../../layouts/main';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '../../lib/i18n-client';
import { MEDIA, MEDIA_EDIT, MEDIA_DELETE } from '../../lib/queries';
import { ProfileContext } from '../../lib/context';
import { Data } from '../../lib/types';
import { MediaQueryProps } from '../../components/media/types';
import MediaComponent from '../../components/media';
import snackbarUtils from '../../lib/snackbar-utils';
// #endregion

const MediaPage: I18nPage = ({ t, ...rest }): React.ReactElement => {
  const { loading, data, error }: QueryResult<Data<'media', MediaQueryProps[]>> = useQuery(MEDIA, {
    ssr: false,
    fetchPolicy: 'cache-first',
  });
  const [current, setCurrent] = useState<MediaQueryProps | undefined>();
  // const profile = useContext(ProfileContext);
  const router = useRouter();
  // const mediaId = router && router.query && router.query.id;

  const handleCurrent = (media: MediaQueryProps) => (): void => {
    setCurrent(media);
  };

  const [deleteMedia] = useMutation(MEDIA_DELETE, {
    refetchQueries: [
      {
        query: MEDIA,
      },
    ],
    awaitRefetchQueries: true,
  });

  const handleDelete = (media: MediaQueryProps) => (): void => {
    if (media && media.id) {
      deleteMedia({ variables: { id: media.id } });
    }
  };

  const handleCloseCurrent = (): void => {
    setCurrent(null);
  };

  useEffect(() => {
    if (error) {
      snackbarUtils.error(error);
    }
  }, [error]);

  return (
    <>
      <Head>
        <title>{t('media:title')}</title>
      </Head>
      <Page {...rest}>
        <MediaComponent
          loading={loading}
          current={current}
          data={data?.media}
          handleCurrent={handleCurrent}
          handleCloseCurrent={handleCloseCurrent}
          handleDelete={handleDelete}
        />
      </Page>
    </>
  );
};

MediaPage.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['media']),
});

export default nextI18next.withTranslation('news')(MediaPage);
