/** @format */

import { gql } from '@apollo/client';

export const SEARCH_SUGGESTIONS = gql`
  query SearchSuggestions($search: String!) {
    searchSuggestions(search: $search) {
      name
      avatar
    }
  }
`;

export const PROFILE_FIELD_SELECTION = gql`
  query ProfileFieldSelection($field: FieldSelection!) {
    profileFieldSelection(field: $field)
  }
`;
