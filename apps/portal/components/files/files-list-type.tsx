/** @format */

//#region Imports NPM
import React from 'react';
import { SvgIconProps } from '@material-ui/core';
import FolderIcon from '@material-ui/icons/Folder';
import FolderSharedIcon from '@material-ui/icons/FolderShared';
import PermMediaIcon from '@material-ui/icons/PermMedia';
import FileIcon from '@material-ui/icons/DescriptionRounded';
//#endregion
//#region Imports Local
import { FilesFolder } from '@back/files/graphql/FilesFolder';
//#endregion

interface FilesListTypeProps extends SvgIconProps {
  current: FilesFolder;
}

export const FilesListType: React.FC<FilesListTypeProps> = ({ current, ...rest }) => {
  if (current.type === 'FOLDER') {
    if (current.mount === 'group') {
      return <FolderSharedIcon {...rest} />;
    }
    if (Array.isArray(current.shareTypes) && current.shareTypes.length > 0) {
      return <PermMediaIcon {...rest} />;
    }
    return <FolderIcon {...rest} />;
  }

  return <FileIcon {...rest} />;
};
