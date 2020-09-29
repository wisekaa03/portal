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
  pathname?: string;
  id?: string;
}

const DocFlowTasksPageIndex: I18nPage<DocFlowTasksPageProps> = ({ t, i18n, pathname, id, ...rest }): React.ReactElement =>
  pathname?.includes('task') && id ? (
    <DocFlowTaskPage id={id} {...rest} />
  ) : pathname?.includes('target') && id ? (
    <DocFlowTargetPage id={id} {...rest} />
  ) : (
    <DocFlowTasksPage {...rest} />
  );

DocFlowTasksPageIndex.getInitialProps = ({ pathname, query }) => {
  const id = query.id as string;

  return {
    pathname,
    id,
    namespacesRequired: includeDefaultNamespaces(['docflow']),
  };
};

export default nextI18next.withTranslation('docflow')(DocFlowTasksPageIndex);
