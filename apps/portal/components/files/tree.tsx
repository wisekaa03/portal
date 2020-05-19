/** @format */

//#region Imports NPM
import React, { FC, useContext } from 'react';
//#endregion
//#region Imports Local
import { useTranslation } from '@lib/i18n-client';
import { FilesTreeComponentProps, FilesFolderTreeVirtual, FilesFolder } from '@lib/types';
import { ProfileContext } from '@lib/context';
import { FILES_SHARED_NAME } from '@lib/constants';
import { TreeView, TreeItem } from '@front/components/tree-view';
//#endregion

const FilesTreeComponent: FC<FilesTreeComponentProps> = ({ data = [], item, setItem, handleEdit }) => {
  const { user } = useContext(ProfileContext);
  const { t } = useTranslation();

  const USER_FOLDER_ID = user?.username;

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
            ? t('files:sharedFolder')
            : child.name === USER_FOLDER_ID
            ? t('files:userFolder')
            : child.name;

        const childs = child.childs.map((c) => recursive(c, depth + 1));

        return (
          <TreeItem
            key={child.pathname}
            nodeId={child.pathname}
            labelText={name}
            id={child.id}
            active={child.pathname === item}
            parent={childs.length > 0}
            handleEdit={handleEdit}
            depth={depth}
          >
            {childs}
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
