/** @format */

//#region Imports NPM
import React from 'react';
//#endregion
//#region Imports Local
import { includeDefaultNamespaces, nextI18next, I18nPage } from '@lib/i18n-client';
// import DocFlowTargetPage from '@front/pages/docflow/target.tsx.bak';
import DocFlowTaskPage from '@front/pages/docflow/task';
import DocFlowTasksPage from '@front/pages/docflow/tasks';
//#endregion

interface DocFlowTasksPageProps {
  pathname?: string;
  type: string;
  id: string;
}

const DocFlowTasksPageIndex: I18nPage<DocFlowTasksPageProps> = ({ t, i18n, pathname, type, id, ...rest }) =>
  pathname?.includes('task') && type && id ? (
    <DocFlowTaskPage type={type} id={id} {...rest} />
  ) : (
    // ) : pathname?.includes('target') && id ? (
    //   <DocFlowTargetPage id={id} {...rest} />
    <DocFlowTasksPage {...rest} />
  );

DocFlowTasksPageIndex.getInitialProps = ({ pathname, query }) => {
  const { id, type } = query;

  return {
    pathname,
    id,
    type,
    namespacesRequired: includeDefaultNamespaces(['docflow']),
  };
};

export default nextI18next.withTranslation('docflow')(DocFlowTasksPageIndex);
