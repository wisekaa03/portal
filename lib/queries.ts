/** @format */

// #region Imports NPM
import gql from 'graphql-tag';
// #endregion

const PROFILE_FRAGMENT = gql`
  fragment ProfileProps on Profile {
    username
    firstName
    lastName
    middleName
    nameEng
    birthday
    gender
    company
    companyEng
    department
    otdel
    departmentEng
    otdelEng
    positionEng
    title
    telephone
    workPhone
    email
    mobile
    manager {
      id
      firstName
      lastName
      middleName
    }
    country
    postalCode
    region
    town
    street
    updatedAt
    createdAt
    disabled
  }
`;

export const CURRENT_USER = gql`
  query Me {
    me {
      id
      username
      updatedAt
      createdAt
      settings {
        lng
        drawer
      }
      profile {
        ...ProfileProps
        thumbnailPhoto40
      }
    }
  }
  ${PROFILE_FRAGMENT}
`;

export const SYNC = gql`
  mutation Synchronization {
    synchronization
  }
`;

export const CACHE = gql`
  mutation CacheReset {
    cacheReset
  }
`;

export const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      session
    }
  }
`;

export const LOGOUT = gql`
  mutation Logout {
    logout @client
  }
`;

export const PROFILES = (_columns: string): any => gql`
  query Profiles($first: Int, $after: String, $orderBy: ProfileOrder, $search: String, $disabled: Boolean) {
    profiles(first: $first, after: $after, orderBy: $orderBy, search: $search, disabled: $disabled) {
      totalCount
      edges {
        node {
          id
          disabled
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
      thumbnailPhoto
    }
  }
  ${PROFILE_FRAGMENT}
`;

export const USER_SETTINGS = gql`
  mutation UserSettings($value: ProfileSettingsInput) {
    userSettings(value: $value) {
      lng
      drawer
    }
  }
`;
