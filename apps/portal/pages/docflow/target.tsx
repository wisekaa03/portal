/** @format */

//#region Imports NPM
import React, { useState, useContext, useMemo, useEffect } from 'react';
import Head from 'next/head';
import { useQuery, ApolloQueryResult } from '@apollo/client';
//#endregion
//#region Imports Local
import { includeDefaultNamespaces, nextI18next, I18nPage } from '@lib/i18n-client';
import { DOCFLOW_INTERNAL_DOCUMENT, DOCFLOW_INTERNAL_DOCUMENT_SUB } from '@lib/queries';
import type { DocFlowInternalDocument, DocFlowInternalDocumentInput, DocFlowTarget, DocFlowTargetInput } from '@lib/types/docflow';
import { Data } from '@lib/types';
import snackbarUtils from '@lib/snackbar-utils';
import { MaterialUI } from '@front/layout';
import DocFlowInternalDocumentComponent from '@front/components/docflow/target';
//#endregion

interface DocFlowTargetProps {
  id: string;
}

const DocFlowTargetPage: I18nPage<DocFlowTargetProps> = ({ t, i18n, id, ...rest }): React.ReactElement => {
  const {
    loading: loadingDocFlowInternalDocument,
    data: dataDocFlowInternalDocument,
    error: errorDocFlowInternalDocument,
    refetch: refetchDocFlowInternalDocumentInt,
    subscribeToMore: subscribeToMoreDocFlowInternalDocument,
  } = useQuery<Data<'docFlowInternalDocument', DocFlowInternalDocument>, { internalDocument: DocFlowInternalDocumentInput }>(
    DOCFLOW_INTERNAL_DOCUMENT,
    {
      ssr: true,
      fetchPolicy: 'cache-and-network',
      variables: { internalDocument: { id } },
      // notifyOnNetworkStatusChange: true,
    },
  );

  useEffect(() => {
    // TODO: when a subscription used, a fully object is transmitted to client, old too. try to minimize this.
    subscribeToMoreDocFlowInternalDocument({
      document: DOCFLOW_INTERNAL_DOCUMENT_SUB,
      variables: { internalDocument: { id } },
      updateQuery: (prev, { subscriptionData: { data } }) => {
        const updateData = data.docFlowInternalDocument;

        return { docFlowInternalDocument: updateData };
      },
    });
  }, [subscribeToMoreDocFlowInternalDocument, id]);

  const refetchDocFlowInternalDocument = async (
    variables?: Partial<{
      internalDocument: DocFlowInternalDocumentInput;
    }>,
  ): Promise<ApolloQueryResult<Data<'docFlowInternalDocument', DocFlowInternalDocument>>> =>
    refetchDocFlowInternalDocumentInt({ internalDocument: { id, ...variables?.internalDocument, cache: false } });

  const internalDocument = useMemo<DocFlowInternalDocument | undefined>(() => dataDocFlowInternalDocument?.docFlowInternalDocument, [
    dataDocFlowInternalDocument,
  ]);

  useEffect(() => {
    if (errorDocFlowInternalDocument) {
      snackbarUtils.error(errorDocFlowInternalDocument);
    }
  }, [errorDocFlowInternalDocument]);

  return (
    <>
      <Head>
        <title>{t('docflow:title')}</title>
      </Head>
      <MaterialUI refetchComponent={refetchDocFlowInternalDocument} {...rest}>
        <DocFlowInternalDocumentComponent loading={loadingDocFlowInternalDocument} internalDocument={internalDocument} />
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
