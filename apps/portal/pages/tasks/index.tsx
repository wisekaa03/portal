/** @format */

//#region Imports NPM
import React from 'react';
//#endregion
//#region Imports Local
import { TkWhere } from '@back/tickets/graphql/TkWhere';

import { includeDefaultNamespaces, nextI18next, I18nPage } from '@lib/i18n-client';
import TaskPage from '@front/pages/tasks/task';
import TasksPage from '@front/pages/tasks/tasks';
//#endregion

interface TasksPageProps {
  where: TkWhere;
  code: string;
}

const TasksPageIndex: I18nPage<TasksPageProps> = ({ t, i18n, code, where, ...rest }) =>
  code && where ? <TaskPage code={code} where={where} {...rest} /> : <TasksPage {...rest} />;

TasksPageIndex.getInitialProps = ({ query }) => {
  const code = query.code as string;
  const where = query.where as TkWhere;

  return {
    code,
    where,
    namespacesRequired: includeDefaultNamespaces(['tasks']),
  };
};

export default nextI18next.withTranslation('tasks')(TasksPageIndex);
