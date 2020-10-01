/** @format */

import { gql } from '@apollo/client';
import { TICKETS_TASK_FRAGMENT, TICKETS_USER_FRAGMENT, TICKETS_TASK_FILES, TICKETS_TASK_COMMENTS } from './tickets-fragment';

export const TICKETS_ROUTES = gql`
  query TicketsRoutes($routes: TkRoutesInput) {
    ticketsRoutes(routes: $routes) {
      routes {
        id
        where
        code
        name
        description
        avatar
        services {
          id
          where
          code
          name
          description
          avatar
        }
      }
      errors
    }
  }
`;

export const TICKETS_ROUTES_SUB = gql`
  subscription TicketsRoutes($routes: TkRoutesInput) {
    ticketsRoutes(routes: $routes) {
      routes {
        id
        where
        code
        name
        description
        avatar
        services {
          id
          where
          code
          name
          description
          avatar
        }
      }
      errors
    }
  }
`;

export const TICKETS_TASKS = gql`
  query TicketsTasks($tasks: TkTasksInput) {
    ticketsTasks(tasks: $tasks) {
      users {
        id
        where
        code
        name
        login
      }
      tasks {
        ...TicketsTaskProps
        smallBody
      }
      errors
    }
  }
  ${TICKETS_TASK_FRAGMENT}
`;

export const TICKETS_TASKS_SUB = gql`
  subscription TicketsTasks($tasks: TkTasksInput) {
    ticketsTasks(tasks: $tasks) {
      users {
        id
        where
        code
        name
        login
      }
      tasks {
        ...TicketsTaskProps
        smallBody
      }
      errors
    }
  }
  ${TICKETS_TASK_FRAGMENT}
`;

export const TICKETS_TASK_NEW = gql`
  mutation TicketsTaskNew($task: TkTaskNewInput!, $attachments: [Upload]) {
    ticketsTaskNew(task: $task, attachments: $attachments) {
      where
      code
      subject
      route
      service
      organization
      status
      createdDate
    }
  }
`;

export const TICKETS_TASK = gql`
  query TicketsTask($task: TkTaskInput!) {
    ticketsTask(task: $task) {
      users {
        ...TicketsUserProps
      }
      task {
        ...TicketsTaskProps
        body
        availableAction
        availableStages
        files {
          ...TicketsFiles
        }
        comments {
          ...TicketsComments
        }
      }
    }
  }
  ${TICKETS_USER_FRAGMENT}
  ${TICKETS_TASK_FRAGMENT}
  ${TICKETS_TASK_FILES}
  ${TICKETS_TASK_COMMENTS}
`;

export const TICKETS_TASK_SUB = gql`
  subscription TicketsTask($task: TkTaskInput!) {
    ticketsTask(task: $task) {
      users {
        ...TicketsUserProps
      }
      task {
        ...TicketsTaskProps
        body
        availableAction
        availableStages
        files {
          ...TicketsFiles
        }
        comments {
          ...TicketsComments
        }
      }
    }
  }
  ${TICKETS_USER_FRAGMENT}
  ${TICKETS_TASK_FRAGMENT}
  ${TICKETS_TASK_FILES}
  ${TICKETS_TASK_COMMENTS}
`;

export const TICKETS_TASK_EDIT = gql`
  mutation TicketsEdit($task: TkTaskEditInput!, $attachments: [Upload]) {
    ticketsTaskEdit(task: $task, attachments: $attachments) {
      users {
        ...TicketsUserProps
      }
      task {
        ...TicketsTaskProps
        body
        availableAction
        availableStages
        files {
          ...TicketsFiles
        }
        comments {
          ...TicketsComments
        }
      }
    }
  }
  ${TICKETS_USER_FRAGMENT}
  ${TICKETS_TASK_FRAGMENT}
  ${TICKETS_TASK_FILES}
  ${TICKETS_TASK_COMMENTS}
`;

export const TICKETS_TASK_FILE = gql`
  mutation TicketsTaskFile($file: TkFileInput!) {
    ticketsTaskFile(file: $file) {
      ...TicketsFiles
    }
  }
  ${TICKETS_TASK_FILES}
`;

export const TICKETS_COMMENT = gql`
  mutation TicketsComment($file: TkFileInput!) {
    ticketsComment(file: $file) {
      ...TicketsFiles
    }
  }
  ${TICKETS_TASK_COMMENTS}
`;
