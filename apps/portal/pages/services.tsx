/** @format */

// #region Imports NPM
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useQuery, useMutation } from '@apollo/react-hooks';
// #endregion
// #region Imports Local
import { includeDefaultNamespaces, nextI18next, I18nPage } from '@lib/i18n-client';
import {
  Data,
  DropzoneFile,
  ServicesTaskProps,
  ServicesCreatedProps,
  OldServices,
  ServicesFavoriteProps,
  TkRoutes,
} from '@lib/types';
import { OLD_TICKET_SERVICE, OLD_TICKET_NEW } from '@lib/queries';
import snackbarUtils from '@lib/snackbar-utils';
import ServicesComponent from '@front/components/services';
import { MaterialUI } from '@front/layout';
// #endregion

const ServicesPage: I18nPage = ({ t, pathname, query, ...rest }): React.ReactElement => {
  const router = useRouter();

  const [currentTab, setCurrentTab] = useState<number>(0);
  const [routes, setRoutes] = useState<TkRoutes[]>([]);
  const [task, setTask] = useState<ServicesTaskProps>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [created, setCreated] = useState<ServicesCreatedProps>({});
  const [body, setBody] = useState<string>('');
  const [files, setFiles] = useState<DropzoneFile[]>([]);

  const { loading: loadingServices, data: dataServices, error: errorServices, refetch: refetchServices } = useQuery<
    Data<'OldTicketService', OldServices[]>,
    void
  >(OLD_TICKET_SERVICE, {
    ssr: false,
    fetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  });

  const [createTicket, { loading: loadingCreated, data: dataCreated, error: errorCreated }] = useMutation(
    OLD_TICKET_NEW,
  );

  const contentRef = useRef(null);
  const serviceRef = useRef<HTMLSelectElement>(null);
  const bodyRef = useRef(null);

  const handleService = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>): void => {
      const service = task.route?.services?.find(({ code }) => code === event.target.value);
      setTask({ ...task, service });
    },
    [task],
  );

  const handleResetTicket = (): void => {
    setTask({});
    setBody('');
    setFiles([]);
    setCurrentTab(0);
    router.push(pathname, pathname);
  };

  const handleSubmit = (): void => {
    const { route, service } = task;

    const cleanedBody = body.trim();

    if (cleanedBody.length < 10) {
      snackbarUtils.show(t('services:errors.smallBody'));
      // bodyRef.current.focus();

      return;
    }

    // TODO: доработать данные
    const variables = {
      ticket: {
        // title: cleanedTitle,
        body: cleanedBody,
        // serviceId: service ? service.code : null,
        // categoryId: category ? category.code : null,
        // categoryType: category ? category.categoryType : null,
      },
      attachments: files.map((file: DropzoneFile) => file.file),
    };

    createTicket({
      variables,
    });

    setCreated({});
    setCurrentTab(4);
  };

  useEffect(() => {
    if (!__SERVER__ && routes) {
      // const { service } = query;
      // const initialState = { ...defaultTicketState };
      // let tab = 0;
      // if (service) {
      //   const currentService = services.find(({ code }) => code === service);
      //   if (currentService) {
      //     tab = 1;
      //     initialState.service = currentService;
      //   } else if (service.indexOf('k', 0)) {
      //     return;
      //   }
      // }
      // setCurrentTab(tab);
      // setTask(initialState);
    }
  }, [routes, setTask, setCurrentTab, query]);

  // TODO: доработать данные
  // useEffect(() => {
  //   if (!loadingServices && !errorServices) {
  //     const svc = dataServices!.OldTicketService!.reduce((acc, srv) => {
  //       if (srv.error) {
  //         snackbarUtils.error(srv.error);
  //         return acc;
  //       }
  //       return srv.services ? [...acc, ...srv.services] : acc;
  //     }, [] as OldService[]);

  //     setServices(svc);
  //   }
  // }, [dataServices, errorServices, loadingServices]);

  // useEffect(() => {
  //   setCreated(!loadingCreated && !errorCreated && dataCreated?.OldTicketNew);
  // }, [dataCreated, errorCreated, loadingCreated]);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.updateHeight();
    }
  }, [contentRef, files]);

  useEffect(() => {
    if (errorCreated) {
      snackbarUtils.error(errorCreated);
    }
    if (errorServices) {
      snackbarUtils.error(errorServices);
    }
  }, [errorCreated, errorServices]);

  // TODO: нужен масив избранных сервисов
  // TODO: нужна мутация на изменения избранных сервисов

  return (
    <>
      <Head>
        <title>
          {task.service ? t('services:title.service', { service: task.service.name }) : t('services:title.title')}
        </title>
      </Head>
      <MaterialUI {...rest}>
        <ServicesComponent
          contentRef={contentRef}
          serviceRef={serviceRef}
          bodyRef={bodyRef}
          currentTab={currentTab}
          task={task}
          created={created}
          routes={routes}
          favorites={[]}
          body={body}
          setBody={setBody}
          files={files}
          setFiles={setFiles}
          submitted={submitted}
          loadingRoutes={loadingServices}
          loadingCreated={loadingCreated}
          refetchRoutes={refetchServices}
          handleCurrentTab={setCurrentTab}
          handleService={handleService}
          handleSubmit={handleSubmit}
          handleResetTicket={handleResetTicket}
          handleFavorites={(props: ServicesFavoriteProps) => {}}
        />
      </MaterialUI>
    </>
  );
};

ServicesPage.getInitialProps = ({ pathname, query }) => ({
  pathname,
  query,
  namespacesRequired: includeDefaultNamespaces(['services']),
});

export default nextI18next.withTranslation('services')(ServicesPage);
