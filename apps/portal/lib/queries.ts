/** @format */
/* eslint max-len:0 */

//#region Imports NPM
import { gql } from '@apollo/client';
import type { DocumentNode } from '@apollo/client';
//#endregion
//#region  Imports Local
import type { UserSettings } from './types/user.dto';
import { TASK_STATUSES } from './constants';
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

export const CURRENT_USER = gql`
  query Me {
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

/** ---------------------------------------------------------------------------------------------------------------------------------------
 * Ticket
 */

const TICKETS_USER_FRAGMENT = gql`
  fragment TicketsUserProps on TkUser {
    id
    where
    code
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
    id
    where
    code
    subject
    status
    createdDate
    endDate
    timeoutDate
    executorUser
    initiatorUser
    route {
      id
      where
      code
      name
      description
      avatar
    }
    service {
      id
      where
      code
      name
      description
      avatar
    }
  }
`;

const TICKETS_TASK_FILES = gql`
  fragment TicketsFiles on TkFile {
    id
    where
    code
    name
    mime
    body
  }
`;

const TICKETS_TASK_COMMENTS = gql`
  fragment TicketsComments on TkComment {
    id
    where
    code
    authorLogin
    body
    date
    parentCode
    files {
      id
      where
      code
      name
      mime
      body
    }
  }
`;

export const TICKETS_ROUTES = gql`
  query TicketsRoutes($routes: TkRoutesInput) {
    ticketsRoutes(routes: $routes) {
      routes {
        id
        where
        code
        name
        description
        avatar
        services {
          id
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

export const TICKETS_ROUTES_SUB = gql`
  subscription TicketsRoutes($routes: TkRoutesInput) {
    ticketsRoutes(routes: $routes) {
      routes {
        id
        where
        code
        name
        description
        avatar
        services {
          id
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
  query TicketsTasks($tasks: TkTasksInput) {
    ticketsTasks(tasks: $tasks) {
      users {
        id
        where
        code
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

export const TICKETS_TASKS_SUB = gql`
  subscription TicketsTasks($tasks: TkTasksInput) {
    ticketsTasks(tasks: $tasks) {
      users {
        id
        where
        code
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
    ticketsTaskNew(task: $task, attachments: $attachments) {
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

export const TICKETS_TASK = gql`
  query TicketsTask($task: TkTaskInput!) {
    ticketsTask(task: $task) {
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

export const TICKETS_TASK_SUB = gql`
  subscription TicketsTask($task: TkTaskInput!) {
    ticketsTask(task: $task) {
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
    ticketsTaskEdit(task: $task, attachments: $attachments) {
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

export const TICKETS_TASK_FILE = gql`
  mutation TicketsTaskFile($file: TkFileInput!) {
    ticketsTaskFile(file: $file) {
      ...TicketsFiles
    }
  }
  ${TICKETS_TASK_FILES}
`;

export const TICKETS_COMMENT = gql`
  mutation TicketsComment($file: TkFileInput!) {
    ticketsComment(file: $file) {
      ...TicketsFiles
    }
  }
  ${TICKETS_TASK_COMMENTS}
`;

/**
 * DocFlow
 */

export const DOCFLOW_USER_FRAGMENT = gql`
  fragment UserProps on DocFlowUser {
    id
    name
  }
`;

export const DOCFLOW_STATE_FRAGMENT = gql`
  fragment StateProps on DocFlowState {
    id
    name
  }
`;

export const DOCFLOW_ORGANIZATION_FRAGMENT = gql`
  fragment OrganizationProps on DocFlowOrganization {
    id
    name
    fullName
    inn
    kpp
    VATpayer
  }
`;

export const DOCFLOW_SUBDIVISION_FRAGMENT = gql`
  fragment SubdivisionProps on DocFlowSubdivision {
    id
    name
  }
`;

export const DOCFLOW_IMPORTANCE_FRAGMENT = gql`
  fragment ImportanceProps on DocFlowImportance {
    id
    name
  }
`;

export const DOCFLOW_PARENT_TASK_FRAGMENT = gql`
  fragment ParentTaskProps on DocFlowParentTask {
    id
    name
  }
`;

export const DOCFLOW_FILE_FRAGMENT = gql`
  fragment FileProps on DocFlowFile {
    id
    name
    author {
      ...UserProps
    }
    encrypted
    signed
    editing
    description
    binaryData
    extension
    creationDate
    modificationDateUniversal
    size
  }
  ${DOCFLOW_USER_FRAGMENT}
`;

export const DOCFLOW_INTERNAL_DOCUMENT_FRAGMENT = gql`
  fragment InternalDocumentProps on DocFlowInternalDocument {
    id
    name
    presentation
    beginDate
    regDate
    regNumber
    title
    status
    organization {
      ...OrganizationProps
    }
    subdivision {
      ...SubdivisionProps
    }
    responsible {
      ...UserProps
    }
    author {
      ...UserProps
    }
    files {
      object {
        ...FileProps
      }
      error
    }
  }
  ${DOCFLOW_ORGANIZATION_FRAGMENT}
  ${DOCFLOW_SUBDIVISION_FRAGMENT}
  ${DOCFLOW_USER_FRAGMENT}
  ${DOCFLOW_FILE_FRAGMENT}
`;

export const DOCFLOW_TASK_FRAGMENT = gql`
  fragment TaskProps on DocFlowTask {
    id
    name
    importance {
      ...ImportanceProps
    }
    executor {
      ...UserProps
    }
    executed
    executionMark
    beginDate
    dueDate
    endDate
    description
    parentTask {
      ...ParentTaskProps
    }
    processStep
    executionComment
    author {
      ...UserProps
    }
    accepted
    acceptDate
    state {
      ...StateProps
    }
    htmlView
    target {
      ...InternalDocumentProps
    }
    targets {
      name
      allowDeletion
      target {
        id
        presentation
        name

        files {
          object {
            id
            name
            author {
              id
              name
            }
            description
            creationDate
            modificationDateUniversal
            extension
            size
          }
          error
        }
      }
    }
  }
  ${DOCFLOW_PARENT_TASK_FRAGMENT}
  ${DOCFLOW_IMPORTANCE_FRAGMENT}
  ${DOCFLOW_INTERNAL_DOCUMENT_FRAGMENT}
  ${DOCFLOW_USER_FRAGMENT}
  ${DOCFLOW_STATE_FRAGMENT}
`;

export const DOCFLOW_TASKS = gql`
  query DocFlowTasks($tasks: DocFlowTasksInput) {
    docFlowTasks(tasks: $tasks) {
      ...TaskProps
    }
  }
  ${DOCFLOW_TASK_FRAGMENT}
`;

export const DOCFLOW_TASKS_SUB = gql`
  subscription DocFlowTasks($tasks: DocFlowTasksInput) {
    docFlowTasks(tasks: $tasks) {
      id
      name
      importance {
        id
        name
      }
      executor {
        id
        name
      }
      executed
      executionMark
      beginDate
      dueDate
      endDate
      description
      parentTask {
        id
        name
      }
      processStep
      executionComment
      author {
        id
        name
      }
      accepted
      acceptDate
      state {
        id
        name
      }
      target {
        id
        name
        presentation
      }
      targets {
        name
        allowDeletion
        target {
          id
          presentation
          name

          files {
            object {
              id
              name
              author {
                id
                name
              }
              description
              creationDate
              modificationDateUniversal
              extension
              size
            }
            error
          }
        }
      }
    }
  }
`;

export const DOCFLOW_FILE = gql`
  query DocFlowFile($file: DocFlowFileInput!) {
    docFlowFile(file: $file) {
      id
      name
      encrypted
      signed
      author
      description
      creationDate
      modificationDateUniversal
      size
      extension
      binaryData
    }
  }
`;

export const DOCFLOW_TASK = gql`
  query DocFlowTask($task: DocFlowTaskInput!) {
    docFlowTask(task: $task) {
      id
      name
      importance {
        id
        name
      }
      executor {
        id
        name
      }
      executed
      executionMark
      beginDate
      dueDate
      endDate
      description
      parentTask {
        id
        name
      }
      processStep
      executionComment
      author {
        id
        name
      }
      accepted
      acceptDate
      state {
        id
        name
      }
      target {
        id
        name
        presentation
      }
      targets {
        name
        allowDeletion
        target {
          id
          presentation
          name

          files {
            object {
              id
              name
              author {
                id
                name
              }
              description
              creationDate
              modificationDateUniversal
              extension
              size
            }
            error
          }
        }
      }
    }
  }
`;

export const DOCFLOW_TASK_SUB = gql`
  subscription DocFlowTask($task: DocFlowTaskInput!) {
    docFlowTask(task: $task) {
      id
      name
      importance {
        id
        name
      }
      executor {
        id
        name
      }
      executed
      executionMark
      beginDate
      dueDate
      endDate
      description
      parentTask {
        id
        name
      }
      processStep
      executionComment
      author {
        id
        name
      }
      accepted
      acceptDate
      state {
        id
        name
      }
      target {
        id
        name
        presentation
      }
      targets {
        name
        allowDeletion
        target {
          id
          presentation
          name

          files {
            object {
              id
              name
              author {
                id
                name
              }
              description
              creationDate
              modificationDateUniversal
              extension
              size
            }
            error
          }
        }
      }
    }
  }
`;

export const DOCFLOW_TARGET = gql`
  query DocFlowTarget($target: DocFlowTargetInput!) {
    docFlowTarget(target: $target) {
      id
      name
    }
  }
`;

export const DOCFLOW_TARGET_SUB = gql`
  subscription DocFlowTarget($target: DocFlowTargetInput!) {
    docFlowTarget(target: $target) {
      id
      name
    }
  }
`;
