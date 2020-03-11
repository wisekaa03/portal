/** @format */

// #region Imports NPM
import React, { FC, useContext } from 'react';
// #endregion
// #region Imports Local
import { useTranslation } from '../../lib/i18n-client';
import { TreeView, TreeItemDefault, TreeItemCreator } from '../tree-view';
import { FilesTreeComponentProps, FilesFolderTreeVirtual } from './types';
import { FilesFolder } from '../../src/files/models/files.folder.dto';
import { ProfileContext } from '../../lib/context';
import { FILES_SHARED_NAME } from '../../lib/constants';
// #endregion

const CreateFolderItem = ({ nodeId, handleCreate, depth = 0 }): React.ReactElement => {
  const { t } = useTranslation();

  return <TreeItemCreator nodeId={nodeId} labelText={t('files:addFolder')} depth={depth} handleCreate={handleCreate} />;
};

const FilesTreeComponent: FC<FilesTreeComponentProps> = ({ data, item, setItem, handleCreateItem }) => {
  const { user } = useContext(ProfileContext);
  const { t } = useTranslation();

  const SHARED_FOLDER_NAME = t('files:control.shared');
  const USER_FOLDER_ID = user?.username;
  const USER_FOLDER_NAME = user?.profile.fullName;

  const adaptedData = (data || []).reduce((acc: FilesFolderTreeVirtual[], cur: FilesFolder) => {
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
  }, []);

  const sharedFolder = adaptedData.find((cur) => cur.id === FILES_SHARED_NAME);

  if (sharedFolder) {
    sharedFolder.name = SHARED_FOLDER_NAME;
  } else {
    adaptedData.push({ id: FILES_SHARED_NAME, name: SHARED_FOLDER_NAME, childs: [] });
  }

  const userFolder = adaptedData.find((cur) => cur.id === USER_FOLDER_ID);

  if (userFolder) {
    userFolder.name = USER_FOLDER_NAME;
  } else {
    adaptedData.push({ id: USER_FOLDER_ID, name: USER_FOLDER_NAME, childs: [] });
  }

  const items = adaptedData.reduce((acc: React.ReactElement[], cur: FilesFolderTreeVirtual) => {
    const recursive = (child: FilesFolderTreeVirtual, path?: string, depth = 0): React.ReactNode => {
      const name = `${path || ''}/${child.id}`;

      return (
        <TreeItemDefault key={name} nodeId={name} labelText={child.name || child.id} depth={depth}>
          {child.childs.map((c) => recursive(c, name, depth + 1))}
          <CreateFolderItem nodeId={`/${name}/`} depth={depth + 1} handleCreate={handleCreateItem} />
        </TreeItemDefault>
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
