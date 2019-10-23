/** @format */

// #region Imports NPM
import gql from 'graphql-tag';
// #endregion

export const CURRENT_USER = gql`
  {
    me {
      # token
      id
      username
      updatedAt
      createdAt
      profile {
        firstName
        lastName
        middleName
        nameEng
        birthday
        gender
        company
        companyEng
        department
        departmentEng
        otdelEng
        positionEng
        title
        telephone
        workPhone
        mobile
        addressPersonal {
          country
          postalCode
          region
          street
        }
        thumbnailPhoto40
        updatedAt
        createdAt
      }
    }
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
  query Profiles($take: Int, $skip: Int) {
    profiles(take: $take, skip: $skip) {
      id
      ${_columns}
    }
  }
`;

export const PROFILES_SEARCH = (_columns: string): any => gql`
  query Profiles($search: String) {
    profilesSearch(search: $search) {
      id
      ${_columns}
    }
  }
`;

export const PROFILE = gql`
  query Profile($id: ID) {
    profile(id: $id) {
      firstName
      lastName
      middleName
      nameEng
      birthday
      gender
      company
      companyEng
      department
      departmentEng
      otdelEng
      positionEng
      title
      telephone
      workPhone
      mobile
      addressPersonal {
        country
        postalCode
        region
        street
      }
      thumbnailPhoto
      updatedAt
      createdAt
    }
  }
`;
