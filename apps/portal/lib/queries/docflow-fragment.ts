/** @format */

import { gql } from '@apollo/client';

export const DOCFLOW_USER_FRAGMENT = gql`
  fragment UserProps on DocFlowUser {
    id
    name
    type
  }
`;

export const DOCFLOW_STATE_FRAGMENT = gql`
  fragment StateProps on DocFlowBusinessProcessState {
    id
    name
    type
  }
`;

export const DOCFLOW_STATUS_FRAGMENT = gql`
  fragment StatusProps on DocFlowStatus {
    id
    name
    type
  }
`;

export const DOCFLOW_ORGANIZATION_FRAGMENT = gql`
  fragment OrganizationProps on DocFlowOrganization {
    id
    name
    type
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
    type
  }
`;

export const DOCFLOW_IMPORTANCE_FRAGMENT = gql`
  fragment ImportanceProps on DocFlowBusinessProcessTaskImportance {
    id
    name
    type
  }
`;

export const DOCFLOW_ROLE_FRAGMENT = gql`
  fragment RoleProps on DocFlowRole {
    id
    name
    type
  }
`;

export const DOCFLOW_PARENT_TASK_FRAGMENT = gql`
  fragment ParentTaskProps on DocFlowParentTask {
    id
    name
    type
  }
`;

export const DOCFLOW_FILE_FRAGMENT = gql`
  fragment FileProps on DocFlowFile {
    id
    name
    type
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
    type
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
    #files {
    #  object {
    #    ...FileProps
    #  }
    #  error
    #}
  }
  ${DOCFLOW_STATUS_FRAGMENT}
  ${DOCFLOW_ORGANIZATION_FRAGMENT}
  ${DOCFLOW_SUBDIVISION_FRAGMENT}
  ${DOCFLOW_USER_FRAGMENT}
  #${DOCFLOW_FILE_FRAGMENT}
`;

export const DOCFLOW_TARGET_FRAGMENT = gql`
  fragment TargetProps on DocFlowTarget {
    name
    type
    role {
      ...RoleProps
    }
    target {
      ...InternalDocumentProps
    }
    allowDeletion
  }
  ${DOCFLOW_INTERNAL_DOCUMENT_FRAGMENT}
  ${DOCFLOW_ROLE_FRAGMENT}
`;

export const DOCFLOW_BPT_APPROVAL_TASK_APPROVAL = gql`
  fragment TaskApprovalTaskApproval on DocFlowBusinessProcessApprovalTaskApproval {
    ... on DocFlowBusinessProcessApprovalTaskApproval {
      id
      name
      type
      importance {
        ...ImportanceProps
      }
      state {
        ...StateProps
      }
      changeRight
      executed
      executionMark
      executionComment
      beginDate
      dueDate
      endDate
      #description
      #checkResults {
      #  checkComment
      #  returned
      #  executorTask {
      #    id
      #  }
      #}
      #parentTask {
      #  ...ParentTaskProps
      #}
      businessProcessStep
      #performer {
      #  users {
      #    ...UserProps
      #  }
      #}
      author {
        ...UserProps
      }
      accepted
      acceptDate
      #htmlView
      #target {
      #  ...InternalDocumentProps
      #}
      #targets {
      #  name
      #  allowDeletion
      #  target {
      #    ...InternalDocumentProps
      #  }
      #}
    }
  }
  ${DOCFLOW_IMPORTANCE_FRAGMENT}
  ${DOCFLOW_USER_FRAGMENT}
  ${DOCFLOW_STATE_FRAGMENT}
`;

export const DOCFLOW_BPT_APPROVAL_TASK_CHECKUP = gql`
  fragment TaskApprovalTaskCheckup on DocFlowBusinessProcessApprovalTaskCheckup {
    ... on DocFlowBusinessProcessApprovalTaskCheckup {
      id
      name
      type
      importance {
        ...ImportanceProps
      }
      state {
        ...StateProps
      }
      changeRight
      executed
      executionMark
      executionComment
      beginDate
      dueDate
      endDate
      #description
      #checkResults {
      #  checkComment
      #  returned
      #  executorTask {
      #    id
      #  }
      #}
      #parentTask {
      #  ...ParentTaskProps
      #}
      businessProcessStep
      #performer {
      #  users {
      #    ...UserProps
      #  }
      #}
      author {
        ...UserProps
      }
      accepted
      acceptDate
      #htmlView
      #target {
      #  ...InternalDocumentProps
      #}
      #targets {
      #  name
      #  allowDeletion
      #  target {
      #    ...InternalDocumentProps
      #  }
      #}
    }
  }
  ${DOCFLOW_IMPORTANCE_FRAGMENT}
  ${DOCFLOW_USER_FRAGMENT}
  ${DOCFLOW_STATE_FRAGMENT}
`;

export const DOCFLOW_BPT_PERFORMANCE_TASK_CHECKUP = gql`
  fragment TaskPerformanceTaskCheckup on DocFlowBusinessProcessPerfomanceTaskCheckup {
    ... on DocFlowBusinessProcessPerfomanceTaskCheckup {
      id
      name
      type
      importance {
        ...ImportanceProps
      }
      state {
        ...StateProps
      }
      changeRight
      executed
      executionMark
      executionComment
      beginDate
      dueDate
      endDate
      #description
      #checkResults {
      #  checkComment
      #  returned
      #  executorTask {
      #    id
      #  }
      #}
      #parentTask {
      #  ...ParentTaskProps
      #}
      businessProcessStep
      performer {
        user {
          ...UserProps
        }
      }
      author {
        ...UserProps
      }
      accepted
      acceptDate
      #htmlView
      #target {
      #  ...InternalDocumentProps
      #}
      #targets {
      #  name
      #  allowDeletion
      #  target {
      #    ...InternalDocumentProps
      #  }
      #}
    }
  }
  ${DOCFLOW_IMPORTANCE_FRAGMENT}
  ${DOCFLOW_USER_FRAGMENT}
  ${DOCFLOW_STATE_FRAGMENT}
`;

// ${DOCFLOW_FILE_FRAGMENT}
// ${DOCFLOW_PARENT_TASK_FRAGMENT}
// ${DOCFLOW_INTERNAL_DOCUMENT_FRAGMENT}

export const DOCFLOW_TASK_FRAGMENT = gql`
  fragment TaskProps on DocFlowTask {
    ... on DocFlowBusinessProcessApprovalTaskApproval {
      ...TaskApprovalTaskApproval
    }
  }
  ${DOCFLOW_BPT_APPROVAL_TASK_APPROVAL}
`;

export const DOCFLOW_TASKS_FRAGMENT = gql`
  fragment TasksProps on DocFlowTasks {
    task {
      ...TaskApprovalTaskApproval
      ...TaskApprovalTaskCheckup
      ...TaskPerformanceTaskCheckup
    }
  }
  ${DOCFLOW_BPT_APPROVAL_TASK_APPROVAL}
  ${DOCFLOW_BPT_APPROVAL_TASK_CHECKUP}
  ${DOCFLOW_BPT_PERFORMANCE_TASK_CHECKUP}
`;
