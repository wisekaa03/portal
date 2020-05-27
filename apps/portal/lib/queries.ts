/** @format */
/* eslint max-len:0 */

//#region Imports NPM
import gql from 'graphql-tag';
//#endregion
//#region  Imports Local
import { TASK_STATUSES } from './constants/index';
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
    username
    firstName
    lastName
    middleName
    fullName
    nameeng
    birthday
    gender
    company
    companyeng
    department
    otdel
    departmenteng
    otdeleng
    positioneng
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
    accessCard
    updatedAt
    createdAt
    disabled
    notShowing
  }
`;

const TICKET_FRAGMENT = gql`
  fragment TicketProps on TkTask {
    where
    id
    code
    name
    description
    descriptionFull
    status
    createdDate
    endDate
    timeoutDate
    executorUser {
      name
      avatar
      email
      telephone
      company
      department
      division
      title
    }
    initiatorUser {
      name
      avatar
      email
      telephone
      company
      department
      division
      title
    }
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
    files {
      code
      name
      ext
      body
    }
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
        drawer
        task {
          status
          favorites {
            where
            code
            priority
            service {
              where
              code
            }
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
          drawer
          task {
            status
            favorites {
              where
              code
              priority
              service {
                where
                code
              }
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

export const PROFILES = (_columns: string): any => gql`
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

export const USER_SETTINGS = gql`
  mutation UserSettings($value: UserSettingsInput) {
    userSettings(value: $value) {
      id
      settings {
        lng
        drawer
        phonebook {
          columns
        }
        task {
          status
          favorites {
            where
            code
            priority
            service {
              where
              code
            }
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
    searchSuggestions(search: $search)
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

export const FILE = gql`
  query File($id: ID) {
    file(id: $id) {
      id
      createdUser {
        id
        username
      }
      updatedUser {
        id
        username
      }
      updatedAt
      createdAt
      folder
      title
      filename
      mimetype
    }
  }
`;

export const EDIT_FILE = gql`
  mutation EditFile($attachment: Upload!, $folder: String!, $id: ID) {
    editFile(attachment: $attachment, folder: $folder, id: $id) {
      id
      createdUser {
        id
        username
      }
      updatedUser {
        id
        username
      }
      updatedAt
      createdAt
      folder
      title
      filename
      mimetype
    }
  }
`;

export const DELETE_FILE = gql`
  mutation DeleteFile($id: ID) {
    deleteFile(id: $id)
  }
`;

export const FOLDER = gql`
  query Folder($id: ID) {
    folder(id: $id) {
      id
      createdUser {
        id
        username
      }
      updatedUser {
        id
        username
      }
      updatedAt
      createdAt
      pathname
      user {
        id
        username
      }
    }
  }
`;

export const EDIT_FOLDER = gql`
  mutation EditFolder($id: ID, $shared: Boolean!, $pathname: String!) {
    editFolder(id: $id, shared: $shared, pathname: $pathname) {
      id
      createdUser {
        id
        username
      }
      updatedUser {
        id
        username
      }
      updatedAt
      createdAt
      pathname
      user {
        id
        username
      }
    }
  }
`;

export const DELETE_FOLDER = gql`
  mutation DeleteFolder($id: ID!) {
    deleteFolder(id: $id)
  }
`;

/** ---------------------------------------------------------------------------------------------------------------------------------------
 * Ticket
 */

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
      error
    }
  }
`;

export const TICKETS_TASKS = gql`
  query TicketsTasks($status: String) {
    TicketsTasks(task: { status: $status }) {
      tasks {
        where
        code
        type
        name
        description
        status
        route {
          where
          code
          name
          description
          avatar
        }
        service {
          where
          code
          name
          description
          avatar
        }
        createdDate
      }
      error
    }
  }
`;

export const TICKETS_TASK_DESCRIPTION = gql`
  query TicketsTaskDescription($where: String, $code: String) {
    TicketsTaskDescription(task: { where: $where, code: $code }) {
      ...TicketProps
    }
  }
  ${TICKET_FRAGMENT}
`;

export const TICKETS_TASK_NEW = gql`
  mutation TicketsTaskNew($task: TkTaskNewInput!, $attachments: [Upload]) {
    TicketsTaskNew(task: $task, attachments: $attachments) {
      where
      code
      name
      route
      service
      organization
      status
      createdDate
    }
  }
`;

export const TICKETS_TASK_EDIT = gql`
  mutation TicketsEdit($task: TkTaskEditInput!, $attachments: [Upload]) {
    TicketsTaskEdit(task: $task, attachments: $attachments) {
      ...TicketProps
    }
  }
  ${TICKET_FRAGMENT}
`;
