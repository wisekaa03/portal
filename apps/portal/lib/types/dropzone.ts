/** @format */

import type React from 'react';
import type { WithTranslation } from 'next-i18next';

export interface DropzoneFile {
  file: File;
  id: string;
  preview: string;
}

export interface DropzoneProps extends WithTranslation, React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> {
  files: DropzoneFile[];
  setFiles: React.Dispatch<React.SetStateAction<DropzoneFile[]>>;
  filesLimit?: number;
  acceptedFiles?: string[];
  color?: 'primary' | 'secondary';
  mode?: 'full' | 'compact' | 'drop';
  border?: 'full' | 'right' | 'left' | 'top' | 'bottom';
  maxFileSize?: number;
}
