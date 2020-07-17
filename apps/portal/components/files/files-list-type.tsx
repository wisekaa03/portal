/** @format */

//#region Imports NPM
import React, { FC } from 'react';
import { SvgIconProps } from '@material-ui/core';
import FolderIcon from '@material-ui/icons/Folder';
import FileIcon from '@material-ui/icons/DescriptionRounded';
//#endregion
//#region Imports Local
import { Folder } from '@lib/types/files.interface';
//#endregion

interface FilesListType extends SvgIconProps {
  type: Folder;
}

export const FilesListType: FC<FilesListType> = ({ type, ...rest }) =>
  type === 'FOLDER' ? <FolderIcon {...rest} /> : <FileIcon {...rest} />;
