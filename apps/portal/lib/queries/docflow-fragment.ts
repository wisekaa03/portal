/** @format */

import { gql } from '@apollo/client';

export const DOCFLOW_USER_FRAGMENT = gql`
  fragment UserProps on DocFlowUser {
    id
    name
  }
`;

export const DOCFLOW_STATE_FRAGMENT = gql`
  fragment StateProps on DocFlowState {
    id
    name
  }
`;

export const DOCFLOW_STATUS_FRAGMENT = gql`
  fragment StatusProps on DocFlowStatus {
    id
    name
  }
`;

export const DOCFLOW_ORGANIZATION_FRAGMENT = gql`
  fragment OrganizationProps on DocFlowOrganization {
    id
    name
    fullName
    inn
    kpp
    VATpayer
  }
`;

export const DOCFLOW_SUBDIVISION_FRAGMENT = gql`
  fragment SubdivisionProps on DocFlowSubdivision {
    id
    name
  }
`;

export const DOCFLOW_IMPORTANCE_FRAGMENT = gql`
  fragment ImportanceProps on DocFlowImportance {
    id
    name
  }
`;

export const DOCFLOW_PARENT_TASK_FRAGMENT = gql`
  fragment ParentTaskProps on DocFlowParentTask {
    id
    name
  }
`;

export const DOCFLOW_FILE_FRAGMENT = gql`
  fragment FileProps on DocFlowFile {
    id
    name
    author {
      ...UserProps
    }
    encrypted
    signed
    editing
    description
    extension
    creationDate
    modificationDateUniversal
    size
  }
  ${DOCFLOW_USER_FRAGMENT}
`;

export const DOCFLOW_INTERNAL_DOCUMENT_FRAGMENT = gql`
  fragment InternalDocumentProps on DocFlowInternalDocument {
    id
    name
    presentation
    beginDate
    regDate
    regNumber
    title
    status {
      ...StatusProps
    }
    organization {
      ...OrganizationProps
    }
    subdivision {
      ...SubdivisionProps
    }
    responsible {
      ...UserProps
    }
    author {
      ...UserProps
    }
    files {
      object {
        ...FileProps
      }
      error
    }
  }
  ${DOCFLOW_STATUS_FRAGMENT}
  ${DOCFLOW_ORGANIZATION_FRAGMENT}
  ${DOCFLOW_SUBDIVISION_FRAGMENT}
  ${DOCFLOW_USER_FRAGMENT}
  ${DOCFLOW_FILE_FRAGMENT}
`;

export const DOCFLOW_TASK_FRAGMENT = gql`
  fragment TaskProps on DocFlowTask {
    id
    name
    importance {
      ...ImportanceProps
    }
    state {
      ...StateProps
    }
    executed
    executionMark
    executionComment
    beginDate
    dueDate
    endDate
    description
    parentTask {
      ...ParentTaskProps
    }
    processStep
    performer {
      ...UserProps
    }
    author {
      ...UserProps
    }
    accepted
    acceptDate
    htmlView
    target {
      ...InternalDocumentProps
    }
    targets {
      name
      allowDeletion
      target {
        ...InternalDocumentProps
      }
    }
  }
  ${DOCFLOW_FILE_FRAGMENT}
  ${DOCFLOW_PARENT_TASK_FRAGMENT}
  ${DOCFLOW_IMPORTANCE_FRAGMENT}
  ${DOCFLOW_INTERNAL_DOCUMENT_FRAGMENT}
  ${DOCFLOW_USER_FRAGMENT}
  ${DOCFLOW_STATE_FRAGMENT}
`;
