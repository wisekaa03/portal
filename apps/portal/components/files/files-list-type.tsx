/** @format */

//#region Imports NPM
import React, { FC } from 'react';
import { SvgIconProps } from '@material-ui/core';
import FolderIcon from '@material-ui/icons/Folder';
import FolderSharedIcon from '@material-ui/icons/FolderShared';
import PermMediaIcon from '@material-ui/icons/PermMedia';
import FileIcon from '@material-ui/icons/DescriptionRounded';
//#endregion
//#region Imports Local
import type { FilesFolder } from '@lib/types/files.interface';
//#endregion

interface FilesListTypeProps extends SvgIconProps {
  current: FilesFolder;
}

export const FilesListType: FC<FilesListTypeProps> = ({ current, ...rest }) => {
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
