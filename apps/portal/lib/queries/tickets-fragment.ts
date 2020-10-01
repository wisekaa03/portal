/** @format */

import { gql } from '@apollo/client';

export const TICKETS_USER_FRAGMENT = gql`
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

export const TICKETS_TASK_FRAGMENT = gql`
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

export const TICKETS_TASK_FILES = gql`
  fragment TicketsFiles on TkFile {
    id
    where
    code
    name
    mime
    body
  }
`;

export const TICKETS_TASK_COMMENTS = gql`
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
