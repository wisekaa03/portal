/** @format */

// #region Imports NPM
import React, { useEffect, useState } from 'react';
import { QueryResult } from 'react-apollo';
import { useMutation, useLazyQuery, useQuery } from '@apollo/react-hooks';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { Box, IconButton } from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
// #endregion
// #region Imports Local
import Button from '../../components/ui/button';
import Page from '../../layouts/main';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '../../lib/i18n-client';
import { MEDIA_EDIT, MEDIA, FOLDERS } from '../../lib/queries';
import { Loading } from '../../components/loading';
import { Media } from '../../src/media/models/media.dto';
import Dropzone from '../../components/dropzone';
import { DropzoneFile } from '../../components/dropzone/types';
import { TreeView, TreeItem } from '../../components/tree-view';
import { Data } from '../../lib/types';
// #endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dropBox: {
      padding: theme.spacing(1, 2),
    },
    firstBlock: {
      display: 'grid',
      gap: `${theme.spacing(2)}px`,
      width: '100%',
      [theme.breakpoints.up('lg')]: {
        gridTemplateColumns: '1fr 1fr',
      },
    },
    sharedOrUser: {
      flexDirection: 'row',
    },
    treeView: {
      textAlign: 'left',
    },
  }),
);

const MediaEdit: I18nPage = ({ t, ...rest }): React.ReactElement => {
  const classes = useStyles({});
  const [title, setTitle] = useState<string | undefined>();
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

  useEffect(() => {
    if (router && router.query && router.query.id) {
      const id = router.query.id as string;
      getMedia({
        variables: { id },
      });
      setUpdated({ id } as any);
      setTitle('media:edit.title');
    } else {
      setCurrent(undefined);
      setTitle('media:add.title');
    }
  }, [getMedia, router]);

  useEffect(() => {
    if (!loading && !error && data && data.media) {
      setCurrent(data.media);
    }
  }, [loading, data, error]);

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

  return (
    <>
      <Head>
        <title>{t(title)}</title>
      </Head>
      <Page {...rest}>
        <Box display="flex" flexDirection="column">
          <Loading activate={loading} noMargin type="linear" variant="indeterminate">
            <>
              <Box display="flex" flexDirection="column" pt={2} px={2} pb={1} overflow="auto">
                <Box display="flex" mb={1}>
                  <Link href={{ pathname: '/media' }} as="/media" passHref>
                    <IconButton>
                      <ArrowBackIcon />
                    </IconButton>
                  </Link>
                  <Box flex={1} display="flex" alignItems="center" justifyContent="flex-end">
                    <Button onClick={handleUpload}>{t(title)}</Button>
                  </Box>
                </Box>
              </Box>
              <Box display="flex" className={classes.dropBox} flexDirection="column">
                <TreeView>
                  <TreeItem nodeId="1" labelText="Directory" />
                  <TreeItem nodeId="2" labelText="Directory" />
                </TreeView>
              </Box>
              <Box display="flex" className={classes.dropBox} flexDirection="column">
                <Dropzone files={attachments} setFiles={setAttachments} color="secondary" />
              </Box>
            </>
          </Loading>
        </Box>
      </Page>
    </>
  );
};

MediaEdit.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['media']),
});

export default nextI18next.withTranslation('media')(MediaEdit);
