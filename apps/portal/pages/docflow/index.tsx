/** @format */

//#region Imports NPM
import React from 'react';
//#endregion
//#region Imports Local
import { includeDefaultNamespaces, nextI18next, I18nPage } from '@lib/i18n-client';
import DocFlowTargetPage from '@front/pages/docflow/target';
import DocFlowTaskPage from '@front/pages/docflow/task';
import DocFlowTasksPage from '@front/pages/docflow/tasks';
//#endregion

interface DocFlowTasksPageProps {
  docFlowTask?: string;
  docFlowTarget?: string;
}

const DocFlowTasksPageIndex: I18nPage<DocFlowTasksPageProps> = ({ t, i18n, docFlowTask, docFlowTarget, ...rest }): React.ReactElement =>
  docFlowTask ? (
    <DocFlowTaskPage id={docFlowTask} {...rest} />
  ) : docFlowTarget ? (
    <DocFlowTargetPage id={docFlowTarget} {...rest} />
  ) : (
    <DocFlowTasksPage {...rest} />
  );

DocFlowTasksPageIndex.getInitialProps = ({ query }) => {
  const docFlowTask = query.docFlowTask as string;
  const docFlowTarget = query.docFlowTarget as string;

  return {
    docFlowTask,
    docFlowTarget,
    namespacesRequired: includeDefaultNamespaces(['docflow']),
  };
};

export default nextI18next.withTranslation('docflow')(DocFlowTasksPageIndex);
