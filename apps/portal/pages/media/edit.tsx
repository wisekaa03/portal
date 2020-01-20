/** @format */

// #region Imports NPM
import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useMutation, useLazyQuery } from '@apollo/react-hooks';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { Box, IconButton, InputAdornment } from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
// #endregion
// #region Imports Local
import Button from '../../components/button';
import Page from '../../layouts/main';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '../../lib/i18n-client';
import { MEDIA_EDIT, MEDIA } from '../../lib/queries';
import { Loading } from '../../components/loading';
import { Media } from '../../src/media/models/media.dto';
import Dropzone from '../../components/dropzone';
import { DropzoneFile } from '../../components/dropzone/types';
// #endregion

const useStyles = makeStyles((theme: Theme) => createStyles({}));

const MediaEdit: I18nPage = ({ t, ...rest }): React.ReactElement => {
  // eslint-disable-next-line no-debugger
  debugger;

  const classes = useStyles({});
  const [getMedia, { loading, error, data }] = useLazyQuery(MEDIA);
  const [mediaEdit] = useMutation(MEDIA_EDIT);
  const router = useRouter();
  const title = router.query.id ? 'media:edit:title' : 'media:add:title';

  const [current, setCurrent] = useState<Media | undefined>();
  const [updated, setUpdated] = useState<Media | undefined>();

  const [files, setFiles] = useState<DropzoneFile[]>([]);

  useEffect(() => {
    if (router && router.query && router.query.id) {
      const id = router.query.id as string;
      getMedia({
        variables: { id },
      });
      setUpdated({ id } as any);
    } else {
      setCurrent({} as any);
    }
  }, [getMedia, router]);

  useEffect(() => {
    if (!loading && !error && data && data.media) {
      setCurrent(data.media);
    }
  }, [loading, data, error]);

  const handleSave = (): void => {
    mediaEdit({
      variables: {
        title: 'First',
        content: files,
        ...updated,
      },
    });
  };

  return (
    <>
      <Head>
        <title>{t(title)}</title>
      </Head>
      <Page {...rest}>
        <Box display="flex" flexDirection="column">
          <>
            {!current && <Loading noMargin type="linear" variant="indeterminate" />}
            {current && (
              <>
                <Box display="flex" flexDirection="column" p={2} overflow="auto">
                  <Box display="flex" mb={1}>
                    <Link href={{ pathname: '/media' }} passHref>
                      <IconButton>
                        <ArrowBackIcon />
                      </IconButton>
                    </Link>
                    <Box flex={1} display="flex" alignItems="center" justifyContent="flex-end">
                      <Button onClick={handleSave}>{t('common:accept')}</Button>
                    </Box>
                  </Box>
                </Box>
                <Box>
                  <Box display="flex" flexDirection="column">
                    <Dropzone setFiles={setFiles} files={files} {...rest} />
                  </Box>
                </Box>
              </>
            )}
          </>
        </Box>
      </Page>
    </>
  );
};

MediaEdit.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['media']),
});

export default nextI18next.withTranslation('media')(MediaEdit);
