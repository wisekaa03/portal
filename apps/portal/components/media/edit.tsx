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
import { MediaEditComponentProps, MediaFolderTreeVirtual } from './types';
import { MediaFolder } from '../../src/media/models/media.folder.dto';
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

const CreateFolderItem = ({ nodeId, handleCreate, depth = 0 }): React.ReactElement => {
  const { t } = useTranslation();

  return <TreeItem nodeId={nodeId} labelText={t('media:addFolder')} depth={depth} handleCreate={handleCreate} />;
};

const CommonFolderItem = (): React.ReactElement => {
  const { t } = useTranslation();

  return <TreeItem key="/" nodeId="/" labelText={t('media:control.shared')} />;
};

const MediaEditComponent: FC<MediaEditComponentProps> = ({
  loading,
  foldersLoading,
  folderData,
  current,
  handleCreateFolder,
  attachments,
  setAttachments,
  handleUpload,
}) => {
  const classes = useStyles({});
  const { t } = useTranslation();

  const folders = folderData
    ? folderData
        .reduce((acc: MediaFolderTreeVirtual[], cur: MediaFolder) => {
          const { pathname } = cur;
          const tree = pathname.split('/').filter((item) => !!item);

          if (tree.length === 0) {
            return [];
          }

          const recursive = (childs: MediaFolderTreeVirtual[], arr: string[], idx = 0): MediaFolderTreeVirtual[] => {
            if (arr.length === 1 || arr.length - 1 === idx) {
              if (!childs.find((r) => r.id === arr[idx])) {
                return [...childs, { id: arr[idx], childs: [] }];
              }

              return childs;
            }

            const elem = childs.find((r) => r.id === arr[idx]);

            if (elem) {
              elem.childs = recursive(elem.childs, arr, idx + 1);

              return childs;
            }

            return [...childs, { id: arr[idx], childs: recursive([], arr, idx + 1) }];
          };

          return recursive(acc, tree);
        }, [])
        .reduce(
          (acc: React.ReactElement[], cur: MediaFolderTreeVirtual) => {
            const recursive = (child: MediaFolderTreeVirtual, path?: string, depth = 0): React.ReactNode => {
              const name = `${path || ''}/${child.id}`;

              return (
                <TreeItem key={name} nodeId={name} labelText={child.id} depth={depth}>
                  {child.childs.map((c) => recursive(c, name, depth + 1))}
                  <CreateFolderItem nodeId={`/${name}/`} depth={depth + 1} handleCreate={handleCreateFolder} />
                </TreeItem>
              );
            };

            return [...acc, recursive(cur)];
          },
          [<CommonFolderItem />],
        )
    : [];

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
                {React.Children.map(folders, (child: React.ReactElement) => (
                  <React.Fragment key={child.key}>{child}</React.Fragment>
                ))}
                <CreateFolderItem nodeId="//" handleCreate={handleCreateFolder} />
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
