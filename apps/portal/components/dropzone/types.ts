/** @format */

export interface DropzoneFile {
  file: File;
  id: string;
  preview: string;
}

export interface DropzoneProps {
  files: DropzoneFile[];
  setFiles: any;
  filesLimit?: number;
  acceptedFiles?: string[];
  maxFileSize?: number;
  color?: 'primary' | 'secondary';
}
