/** @format */

// #region Imports NPM
import React, { FC } from 'react';
// #endregion
// #region Imports Local
import { useTranslation } from '../../lib/i18n-client';
import { TreeView, TreeItem } from '../tree-view';
import { MediaTreeComponentProps, MediaFolderTreeVirtual } from './types';
import { MediaFolder } from '../../src/media/models/media.folder.dto';
// #endregion

const CreateFolderItem = ({ nodeId, handleCreate, depth = 0 }): React.ReactElement => {
  const { t } = useTranslation();

  return <TreeItem nodeId={nodeId} labelText={t('media:addFolder')} depth={depth} handleCreate={handleCreate} />;
};

const CommonFolderItem = (): React.ReactElement => {
  const { t } = useTranslation();

  return <TreeItem key="/" nodeId="/" labelText={t('media:control.shared')} />;
};

const MediaTreeComponent: FC<MediaTreeComponentProps> = ({ data, item, setItem, handleCreateItem }) => {
  const items = data
    ? data
        .reduce((acc: MediaFolderTreeVirtual[], cur: MediaFolder) => {
          const { pathname } = cur;
          const tree = pathname.split('/').filter((i) => !!i);

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
                  <CreateFolderItem nodeId={`/${name}/`} depth={depth + 1} handleCreate={handleCreateItem} />
                </TreeItem>
              );
            };

            return [...acc, recursive(cur)];
          },
          [<CommonFolderItem />],
        )
    : [];

  return (
    <TreeView selected={item} setSelected={setItem}>
      {React.Children.map(items, (child: React.ReactElement) => (
        <React.Fragment key={child.key}>{child}</React.Fragment>
      ))}
      <CreateFolderItem nodeId="//" handleCreate={handleCreateItem} />
    </TreeView>
  );
};

export default MediaTreeComponent;
