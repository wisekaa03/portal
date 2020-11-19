/** @format */

import { gql } from '@apollo/client';
import type { DocumentNode } from '@apollo/client';
import { PROFILE_FRAGMENT } from './profiles-fragment';

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
  mutation ChangeProfile($profile: ProfileSettingsInput, $thumbnailPhoto: Upload, $domain: String!) {
    changeProfile(profile: $profile, thumbnailPhoto: $thumbnailPhoto, domain: $domain) {
      id
    }
  }
`;

export const LDAP_NEW_USER = gql`
  mutation LdapNewUser($ldap: ProfileInput!, $photo: Upload, $domain: String!) {
    ldapNewUser(ldap: $ldap, photo: $photo, domain: $domain) {
      ...ProfileProps
    }
  }
  ${PROFILE_FRAGMENT}
`;
