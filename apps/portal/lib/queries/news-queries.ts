/** @format */

import { gql } from '@apollo/client';

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
