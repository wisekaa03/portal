/** @format */

import { gql } from '@apollo/client';

export const FOLDER_FILES_SUBSCRIPTION = gql`
  subscription FolderFilesSubscription($path: String) {
    folderFilesSubscription(path: $path) {
      id
      fileId
      creationDate
      lastModified
      type
      size
      name
      mime
      permissions
      etag
      favorite
      hasPreview
      commentsUnread
      commentsCount
      ownerId
      ownerDisplayName
    }
  }
`;

export const FILES_FOLDER_LIST = gql`
  query FolderFiles($path: String) {
    folderFiles(path: $path) {
      id
      fileId
      creationDate
      lastModified
      type
      mount
      size
      name
      mime
      permissions
      etag
      favorite
      hasPreview
      commentsUnread
      commentsCount
      ownerId
      ownerDisplayName
      resourceType
      shareTypes
      sharePermissions
    }
  }
`;

export const FILES_GET_FILE = gql`
  mutation GetFile($path: String!) {
    getFile(path: $path) {
      path
    }
  }
`;

export const FILES_PUT_FILE = gql`
  mutation PutFile($path: String!, $file: Upload!) {
    putFile(path: $path, file: $file)
  }
`;

export const FILES_DELETE_FILE = gql`
  mutation DeleteFile($id: ID) {
    deleteFile(id: $id)
  }
`;

export const FILES_DELETE_FOLDER = gql`
  mutation DeleteFolder($id: ID!) {
    deleteFolder(id: $id)
  }
`;
