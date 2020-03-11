/** @format */

// #region Imports NPM
import React, { FC, useContext } from 'react';
// #endregion
// #region Imports Local
import { useTranslation } from '../../lib/i18n-client';
import { TreeView, TreeItem } from '../tree-view';
import { FilesTreeComponentProps, FilesFolderTreeVirtual } from './types';
import { FilesFolder } from '../../src/files/models/files.folder.dto';
import { ProfileContext } from '../../lib/context';
import { FILES_SHARED_NAME } from '../../lib/constants';
// #endregion

const FilesTreeComponent: FC<FilesTreeComponentProps> = ({ data = [], item, setItem, handleEdit, handleDelete }) => {
  const { user } = useContext(ProfileContext);
  const { t } = useTranslation();

  const USER_FOLDER_ID = user?.username;
  const USER_FOLDER_NAME = user?.profile.fullName;

  const defaultFolders: FilesFolder[] = [{ pathname: `/${FILES_SHARED_NAME}` }, { pathname: `/${USER_FOLDER_ID}` }];

  const items = [...defaultFolders, ...data]
    .reduce((acc: FilesFolderTreeVirtual[], cur: FilesFolder) => {
      const { id, pathname } = cur;
      const tree = pathname.split('/').filter((i) => !!i);

      if (tree.length === 0) {
        return acc;
      }

      const recursive = (childs: FilesFolderTreeVirtual[], arr: string[], idx = 0): FilesFolderTreeVirtual[] => {
        const elem = childs.find((r) => r.name === arr[idx]);

        if (arr.length === 1 || arr.length - 1 === idx) {
          if (!elem) {
            return [...childs, { id, name: arr[idx], pathname, childs: [] }];
          }

          elem.id = id;
          elem.name = arr[idx];
          elem.pathname = pathname;

          return childs;
        }

        if (elem) {
          elem.childs = recursive(elem.childs, arr, idx + 1);

          return childs;
        }

        return [...childs, { id, name: arr[idx], pathname, childs: recursive([], arr, idx + 1) }];
      };

      return recursive(acc, tree);
    }, [])
    .reduce((acc: React.ReactElement[], cur: FilesFolderTreeVirtual) => {
      const recursive = (child: FilesFolderTreeVirtual, depth = 0): React.ReactNode => {
        const name =
          child.name === FILES_SHARED_NAME
            ? t('files:control.shared')
            : child.name === USER_FOLDER_ID
            ? USER_FOLDER_NAME
            : child.name;

        return (
          <TreeItem
            key={child.pathname}
            nodeId={child.pathname}
            labelText={name}
            id={child.id}
            active={child.pathname === item}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            depth={depth}
          >
            {child.childs.map((c) => recursive(c, depth + 1))}
          </TreeItem>
        );
      };

      return [...acc, recursive(cur)];
    }, []);

  return (
    <TreeView selected={item} setSelected={setItem}>
      {React.Children.map(items, (child: React.ReactElement) => (
        <React.Fragment key={child.key}>{child}</React.Fragment>
      ))}
    </TreeView>
  );
};

export default FilesTreeComponent;
