/** @format */

// #region Imports NPM
import React, { FC } from 'react';
import Link from 'next/link';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { Box, IconButton } from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
// #endregion
// #region Imports Local
import Button from '../ui/button';
import { useTranslation } from '../../lib/i18n-client';
import Loading from '../loading';
import Dropzone from '../dropzone';
import { TreeView, TreeItem } from '../tree-view';
import { MediaEditComponentProps } from './types';
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

const MediaEditComponent: FC<MediaEditComponentProps> = ({
  loading,
  foldersLoading,
  current,
  attachments,
  setAttachments,
  handleUpload,
}) => {
  const classes = useStyles({});
  const { t } = useTranslation();

  return (
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
                <Button onClick={handleUpload}>{t(`media:${current ? 'edit' : 'add'}`)}</Button>
              </Box>
            </Box>
          </Box>
          <Box display="flex" className={classes.dropBox} flexDirection="column">
            <Loading activate={foldersLoading} full color="secondary">
              <TreeView>
                <TreeItem nodeId="1" labelText="Directory" />
                <TreeItem nodeId="2" labelText="Directory" />
              </TreeView>
            </Loading>
          </Box>
          <Box display="flex" className={classes.dropBox} flexDirection="column">
            <Dropzone files={attachments} setFiles={setAttachments} color="secondary" />
          </Box>
        </>
      </Loading>
    </Box>
  );
};

export default MediaEditComponent;
