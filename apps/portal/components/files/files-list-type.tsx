/** @format */

//#region Imports NPM
import React, { FC } from 'react';
import { SvgIconProps } from '@material-ui/core';
import FolderIcon from '@material-ui/icons/Folder';
import FileIcon from '@material-ui/icons/DescriptionRounded';
//#endregion
//#region Imports Local
import { FilesFolder } from '@lib/types/files.interface';
//#endregion

interface FilesListType extends SvgIconProps {
  current: FilesFolder;
}

export const FilesListType: FC<FilesListType> = ({ current, ...rest }) =>
  current.type === 'FOLDER' ? <FolderIcon {...rest} /> : <FileIcon {...rest} />;
