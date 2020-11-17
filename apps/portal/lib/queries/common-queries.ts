/** @format */

import { gql } from '@apollo/client';
import { PROFILE_FRAGMENT } from './profiles-fragment';

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
  query Login($username: String!, $password: String!, $domain: String!) {
    login(username: $username, password: $password, domain: $domain) {
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
