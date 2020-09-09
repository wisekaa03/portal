/** @format */

//#region Imports NPM
import React, { useState, useContext, useMemo, useEffect } from 'react';
import Head from 'next/head';
import { useQuery, useMutation, useLazyQuery, QueryResult } from '@apollo/client';
//#endregion
//#region Imports Local
import { ProfileContext } from '@lib/context';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '@lib/i18n-client';
import { TICKETS_TASKS } from '@lib/queries';
import { TkTask, TkTasks, Data, TkWhere, TkEditTask, TkFileInput, TkFile, DropzoneFile } from '@lib/types';
import snackbarUtils from '@lib/snackbar-utils';
import { MaterialUI } from '@front/layout';
import TasksComponent from '@front/components/tasks/tasks';
//#endregion

const DocFlowPage: I18nPage = ({ t, i18n, ...rest }): React.ReactElement => (
  <>
    <Head>
      <title>{t('docflow:title')}</title>
    </Head>
    <MaterialUI {...rest} />
  </>
);

DocFlowPage.getInitialProps = ({ query }) => {
  const { code, where } = query;

  return {
    query: { code, where },
    namespacesRequired: includeDefaultNamespaces(['docflow']),
  };
};

export default nextI18next.withTranslation('docflow')(DocFlowPage);
