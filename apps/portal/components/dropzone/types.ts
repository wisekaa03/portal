/** @format */

export interface DropzoneFile extends File {
  preview?: string;
}

export interface DropzoneProps {
  files: DropzoneFile[];
  setFiles: (newFiles: DropzoneFile[]) => void;
  filesLimit?: number;
  acceptedFiles?: string[];
  maxFileSize?: number;
}
