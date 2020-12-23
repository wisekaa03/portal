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
import snackbarUtils from '@lib/snackbar-utils';
import { MaterialUI } from '@front/layout';
import TasksComponent from '@front/components/tasks/tasks';
//#endregion

const ReportsPage: I18nPage = ({ t, i18n, ...rest }) => (
  <>
    <Head>
      <title>{t('reports:title')}</title>
    </Head>
    <MaterialUI {...rest} />
  </>
);

ReportsPage.getInitialProps = ({ query }) => {
  const { code, where } = query;

  return {
    query: { code, where },
    namespacesRequired: includeDefaultNamespaces(['reports']),
  };
};

export default nextI18next.withTranslation('reports')(ReportsPage);
