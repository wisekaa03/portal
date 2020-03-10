/** @format */

// #region Imports NPM
import React, { FC } from 'react';
// #endregion
// #region Imports Local
import { useTranslation } from '../../lib/i18n-client';
import { TreeView, TreeItem } from '../tree-view';
import { FilesTreeComponentProps, FilesFolderTreeVirtual } from './types';
import { FilesFolder } from '../../src/files/models/files.folder.dto';
// #endregion

const CreateFolderItem = ({ nodeId, handleCreate, depth = 0 }): React.ReactElement => {
  const { t } = useTranslation();

  return <TreeItem nodeId={nodeId} labelText={t('files:addFolder')} depth={depth} handleCreate={handleCreate} />;
};

const CommonFolderItem = (): React.ReactElement => {
  const { t } = useTranslation();

  return <TreeItem key="/" nodeId="/" labelText={t('files:control.shared')} />;
};

const FilesTreeComponent: FC<FilesTreeComponentProps> = ({ data, item, setItem, handleCreateItem }) => {
  const items = data
    ? data
        .reduce((acc: FilesFolderTreeVirtual[], cur: FilesFolder) => {
          const { pathname } = cur;
          const tree = pathname.split('/').filter((i) => !!i);

          if (tree.length === 0) {
            return [];
          }

          const recursive = (childs: FilesFolderTreeVirtual[], arr: string[], idx = 0): FilesFolderTreeVirtual[] => {
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
          (acc: React.ReactElement[], cur: FilesFolderTreeVirtual) => {
            const recursive = (child: FilesFolderTreeVirtual, path?: string, depth = 0): React.ReactNode => {
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

export default FilesTreeComponent;
