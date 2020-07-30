/** @format */
/* eslint max-len:0 */

//#region Imports NPM
import { gql, DocumentNode } from '@apollo/client';
//#endregion
//#region  Imports Local
import { TASK_STATUSES } from './constants';
import { UserSettings } from './types/user.dto';
//#endregion

export const defaultUserSettings: UserSettings = {
  lng: 'ru',
  drawer: true,
  task: {
    status: TASK_STATUSES[0],
    favorites: [],
  },
};

const PROFILE_FRAGMENT = gql`
  fragment ProfileProps on Profile {
    id
    contact
    username
    firstName
    lastName
    middleName
    fullName
    birthday
    gender
    company
    management
    department
    division
    nameEng
    companyEng
    managementEng
    departmentEng
    divisionEng
    positionEng
    title
    employeeID
    telephone
    workPhone
    email
    mobile
    manager {
      id
      firstName
      lastName
      middleName
      fullName
      disabled
      notShowing
    }
    country
    postalCode
    region
    town
    street
    room
    accessCard
    updatedAt
    createdAt
    disabled
    notShowing
  }
`;

export const SUBSCRIBE_ME = gql`
  subscription Me {
    me {
      id
      username
      updatedAt
      createdAt
      isAdmin
      settings {
        lng
        fontSize
        drawer
        task {
          status
          favorites {
            where
            code
            svcCode
          }
        }
        phonebook {
          columns
        }
      }
      groups {
        id
        name
        dn
        description
        createdAt
        updatedAt
      }
      profile {
        ...ProfileProps
        thumbnailPhoto40
        thumbnailPhoto
      }
    }
  }
  ${PROFILE_FRAGMENT}
`;

export const PING = gql`
  query Ping {
    ping {
      ping
    }
  }
`;

export const CURRENT_USER = gql`
  query Me {
    me @client {
      id
      username
      updatedAt
      createdAt
      isAdmin
      settings {
        lng
        fontSize
        drawer
        task {
          status
          favorites {
            where
            code
            svcCode
          }
        }
        phonebook {
          columns
        }
      }
      groups {
        id
        name
        dn
        description
        createdAt
        updatedAt
      }
      profile {
        ...ProfileProps
        thumbnailPhoto40
        thumbnailPhoto
      }
    }
  }
  ${PROFILE_FRAGMENT}
`;

export const SYNC = gql`
  mutation SyncLdap {
    syncLdap
  }
`;

export const CACHE = gql`
  mutation CacheReset {
    cacheReset
  }
`;

export const LOGIN = gql`
  query Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      user {
        id
        username
        updatedAt
        createdAt
        isAdmin
        settings {
          lng
          fontSize
          drawer
          task {
            status
            favorites {
              where
              code
              svcCode
            }
          }
          phonebook {
            columns
          }
        }
        profile {
          ...ProfileProps
          thumbnailPhoto40
          thumbnailPhoto
        }
        groups {
          id
          name
          dn
          description
          createdAt
          updatedAt
        }
      }
      email {
        login
        error
      }
    }
  }
  ${PROFILE_FRAGMENT}
`;

export const LOGOUT = gql`
  mutation Logout {
    logout
  }
`;

export const PROFILES = (_columns: string): DocumentNode => gql`
  query Profiles($first: Int, $after: String, $orderBy: ProfileOrder, $search: String, $disabled: Boolean, $notShowing: Boolean) {
    profiles(first: $first, after: $after, orderBy: $orderBy, search: $search, disabled: $disabled, notShowing: $notShowing) {
      totalCount
      edges {
        node {
          id
          disabled
          notShowing
          gender
          ${_columns}
        }
        cursor
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;

// export const PROFILES_SEARCH = (_columns: string): any => gql`
//   query Profiles($search: String, $orderBy: ProfileOrder) {
//     profilesSearch(search: $search, orderBy: $orderBy) {
//       id
//       ${_columns}
//     }
//   }
// `;

export const PROFILE = gql`
  query Profile($id: ID) {
    profile(id: $id) {
      ...ProfileProps
      id
      thumbnailPhoto
    }
  }
  ${PROFILE_FRAGMENT}
`;

export const CHANGE_PROFILE = gql`
  mutation ChangeProfile($profile: ProfileSettingsInput, $thumbnailPhoto: Upload) {
    changeProfile(profile: $profile, thumbnailPhoto: $thumbnailPhoto) {
      id
    }
  }
`;

export const LDAP_NEW_USER = gql`
  mutation LdapNewUser($ldap: ProfileInput!, $photo: Upload) {
    ldapNewUser(ldap: $ldap, photo: $photo) {
      ...ProfileProps
    }
  }
  ${PROFILE_FRAGMENT}
`;

export const LDAP_CHECK_USERNAME = gql`
  mutation LdapCheckUsername($value: String!) {
    ldapCheckUsername(value: $value)
  }
`;

export const USER_SETTINGS = gql`
  mutation UserSettings($value: UserSettingsInput) {
    userSettings(value: $value) {
      id
      settings {
        lng
        fontSize
        drawer
        phonebook {
          columns
        }
        task {
          status
          favorites {
            where
            code
            svcCode
          }
        }
      }
    }
  }
`;

/** ---------------------------------------------------------------------------------------------------------------------------------------
 * ADDRESSBOOK
 */

export const SEARCH_SUGGESTIONS = gql`
  query SearchSuggestions($search: String) {
    searchSuggestions(search: $search) {
      name
      avatar
    }
  }
`;

export const PROFILE_FIELD_SELECTION = gql`
  query ProfileFieldSelection($field: FieldSelection!, $department: String) {
    profileFieldSelection(field: $field, department: $department)
  }
`;

/** ---------------------------------------------------------------------------------------------------------------------------------------
 * NEWS
 */

export const NEWS = gql`
  query News {
    news {
      id
      updatedAt
      createdAt
      title
      content
      excerpt
    }
  }
`;

export const NEWS_EDIT = gql`
  mutation editNews($title: String, $excerpt: String, $content: String, $id: ID) {
    editNews(title: $title, excerpt: $excerpt, content: $content, id: $id) {
      id
      title
      excerpt
      content
      user {
        id
        username
      }
      updatedAt
      createdAt
    }
  }
`;

export const NEWS_DELETE = gql`
  mutation deleteNews($id: ID) {
    deleteNews(id: $id)
  }
`;

/** ---------------------------------------------------------------------------------------------------------------------------------------
 * MEDIA
 */

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
    putFile(path: $path)
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

/** ---------------------------------------------------------------------------------------------------------------------------------------
 * Ticket
 */

const TICKETS_USER_FRAGMENT = gql`
  fragment TicketsUserProps on TkUser {
    where
    id
    name
    login
    avatar
    email
    telephone
    company
    department
    division
    manager
    title
  }
`;

const TICKETS_TASK_FRAGMENT = gql`
  fragment TicketsTaskProps on TkTask {
    where
    id
    code
    subject
    status
    createdDate
    endDate
    timeoutDate
    executorUser
    initiatorUser
    route {
      code
      name
      description
      avatar
    }
    service {
      code
      name
      description
      avatar
    }
  }
`;

const TICKETS_TASK_FILES = gql`
  fragment TicketsFiles on TkFile {
    where
    id
    name
    ext
  }
`;

const TICKETS_TASK_COMMENTS = gql`
  fragment TicketsComments on TkComment {
    where
    code
    authorLogin
    body
    date
    parentCode
    files {
      where
      id
      name
      ext
    }
  }
`;

export const TICKETS_ROUTES = gql`
  query {
    TicketsRoutes {
      routes {
        where
        code
        name
        description
        avatar
        services {
          where
          code
          name
          description
          avatar
        }
      }
      errors
    }
  }
`;

export const TICKETS_TASKS = gql`
  query TicketsTasks($status: String) {
    TicketsTasks(task: { status: $status }) {
      users {
        where
        id
        name
        login
      }
      tasks {
        ...TicketsTaskProps
        smallBody
      }
      errors
    }
  }
  ${TICKETS_TASK_FRAGMENT}
`;

export const TICKETS_TASK_NEW = gql`
  mutation TicketsTaskNew($task: TkTaskNewInput!, $attachments: [Upload]) {
    TicketsTaskNew(task: $task, attachments: $attachments) {
      where
      code
      subject
      route
      service
      organization
      status
      createdDate
    }
  }
`;

export const TICKETS_TASK_DESCRIPTION = gql`
  query TicketsTaskDescription($where: String, $code: String) {
    TicketsTaskDescription(task: { where: $where, code: $code }) {
      users {
        ...TicketsUserProps
      }
      task {
        ...TicketsTaskProps
        body
        availableAction
        availableStages
        files {
          ...TicketsFiles
        }
        comments {
          ...TicketsComments
        }
      }
    }
  }
  ${TICKETS_USER_FRAGMENT}
  ${TICKETS_TASK_FRAGMENT}
  ${TICKETS_TASK_FILES}
  ${TICKETS_TASK_COMMENTS}
`;

export const TICKETS_TASK_EDIT = gql`
  mutation TicketsEdit($task: TkTaskEditInput!, $attachments: [Upload]) {
    TicketsTaskEdit(task: $task, attachments: $attachments) {
      users {
        ...TicketsUserProps
        body
      }
      task {
        ...TicketsTaskProps
        body
        availableAction
        availableStages
        files {
          ...TicketsFiles
        }
        comments {
          ...TicketsComments
        }
      }
    }
  }
  ${TICKETS_USER_FRAGMENT}
  ${TICKETS_TASK_FRAGMENT}
  ${TICKETS_TASK_FILES}
  ${TICKETS_TASK_COMMENTS}
`;

export const TICKETS_TASK_FILE = gql`
  mutation TicketsTaskFile($id: TkFileInput!) {
    TicketsTaskFile(id: $id) {
      ...TicketsFiles
      body
    }
  }
  ${TICKETS_TASK_FILES}
`;

export const TICKETS_COMMENT_FILE = gql`
  mutation TicketsCommentFile($id: TkFileInput!) {
    TicketsCommentFile(id: $id) {
      ...TicketsFiles
      body
    }
  }
  ${TICKETS_TASK_FILES}
`;
