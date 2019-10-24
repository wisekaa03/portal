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
    manager
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
  {
    me {
      # token
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
  query Profiles($take: Int, $skip: Int, $orderBy: String, $order: String) {
    profiles(take: $take, skip: $skip, orderBy: $orderBy, order: $order) {
      id
      ${_columns}
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
