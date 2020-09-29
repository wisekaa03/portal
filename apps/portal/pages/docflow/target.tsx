/** @format */

//#region Imports NPM
import React, { useState, useContext, useMemo, useEffect } from 'react';
import Head from 'next/head';
import { useQuery, ApolloQueryResult } from '@apollo/client';
//#endregion
//#region Imports Local
import { includeDefaultNamespaces, nextI18next, I18nPage } from '@lib/i18n-client';
import { DOCFLOW_TARGET, DOCFLOW_TARGET_SUB } from '@lib/queries';
import type { DocFlowTarget, DocFlowTargetInput } from '@lib/types/docflow';
import { Data } from '@lib/types';
import snackbarUtils from '@lib/snackbar-utils';
import { MaterialUI } from '@front/layout';
import DocFlowTargetComponent from '@front/components/docflow/target';
//#endregion

interface DocFlowTargetProps {
  id: string;
}

const DocFlowTargetPage: I18nPage<DocFlowTargetProps> = ({ t, i18n, id, ...rest }): React.ReactElement => {
  const {
    loading: loadingDocFlowTarget,
    data: dataDocFlowTarget,
    error: errorDocFlowTarget,
    refetch: refetchDocFlowTargetInt,
    subscribeToMore: subscribeToMoreDocFlowTarget,
  } = useQuery<Data<'docFlowTarget', DocFlowTarget>, { target: DocFlowTargetInput }>(DOCFLOW_TARGET, {
    ssr: true,
    fetchPolicy: 'cache-first',
    variables: { target: { id } },
    // notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    // TODO: when a subscription used, a fully object is transmitted to client, old too. try to minimize this.
    subscribeToMoreDocFlowTarget({
      document: DOCFLOW_TARGET_SUB,
      variables: { target: { id } },
      updateQuery: (prev, { subscriptionData: { data } }) => {
        const updateData = data?.docFlowTarget || [];

        return { docFlowTarget: updateData };
      },
    });
  }, [subscribeToMoreDocFlowTarget, id]);

  const refetchDocFlowTarget = async (
    variables?: Partial<{
      target: DocFlowTargetInput;
    }>,
  ): Promise<ApolloQueryResult<Data<'docFlowTarget', DocFlowTarget>>> =>
    refetchDocFlowTargetInt({ target: { id, ...variables?.target, cache: false } });

  const target = useMemo<DocFlowTarget | undefined>(() => dataDocFlowTarget?.docFlowTarget, [dataDocFlowTarget]);

  useEffect(() => {
    if (errorDocFlowTarget) {
      snackbarUtils.error(errorDocFlowTarget);
    }
  }, [errorDocFlowTarget]);

  return (
    <>
      <Head>
        <title>{t('docflow:title')}</title>
      </Head>
      <MaterialUI refetchComponent={refetchDocFlowTarget} {...rest}>
        <DocFlowTargetComponent loading={loadingDocFlowTarget} target={target} />
      </MaterialUI>
    </>
  );
};

DocFlowTargetPage.getInitialProps = ({ query }) => {
  const { id } = query;

  return {
    id,
    namespacesRequired: includeDefaultNamespaces(['docflow']),
  };
};

export default nextI18next.withTranslation('docflow')(DocFlowTargetPage);
