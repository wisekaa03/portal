/** @format */

export interface DropzoneFile extends File {
  id?: string;
  preview?: string;
}

export interface DropzoneProps {
  files: DropzoneFile[];
  setFiles: any;
  filesLimit?: number;
  acceptedFiles?: string[];
  maxFileSize?: number;
}
