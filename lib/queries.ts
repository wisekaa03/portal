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

export const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
    }
  }
`;

export const LOGOUT = gql`
  mutation Logout {
    logout @client
  }
`;

export const PROFILES = (_columns: string): any => gql`
  query Profiles($first: Int, $after: String, $orderBy: ProfileOrder) {
    profiles(first: $first, after: $after, orderBy: $orderBy) {
      totalCount
      edges {
        node {
          id
          ${_columns}
        }
      }
      pageInfo {
        startCursor
        endCursor
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

export const PROFILES_SEARCH = (_columns: string): any => gql`
  query Profiles($search: String, $orderBy: String, $order: String) {
    profilesSearch(search: $search, orderBy: $orderBy, order: $order) {
      id
      ${_columns}
    }
  }
`;

export const PROFILE = gql`
  query Profile($id: ID) {
    profile(id: $id) {
      ...ProfileProps
      thumbnailPhoto
    }
  }
  ${PROFILE_FRAGMENT}
`;
