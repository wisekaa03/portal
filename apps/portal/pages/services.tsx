/** @format */

//#region Imports NPM
import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useQuery, useMutation } from '@apollo/react-hooks';
//#endregion
//#region Imports Local
import { includeDefaultNamespaces, nextI18next, I18nPage } from '@lib/i18n-client';
import { Data, DropzoneFile, ServicesTaskProps, ServicesCreatedProps, TkService, TkRoutes } from '@lib/types';
import { TICKETS_ROUTES, TICKETS_TASK_NEW } from '@lib/queries';
import snackbarUtils from '@lib/snackbar-utils';
import ServicesIcon from '@public/images/svg/icons/services.svg';
import ServicesComponent from '@front/components/services';
import { MaterialUI } from '@front/layout';
//#endregion

const defaultTicketState: ServicesTaskProps = { title: '' };

const ServicesPage: I18nPage = ({ t, pathname, query, ...rest }): React.ReactElement => {
  const router = useRouter();

  const [currentTab, setCurrentTab] = useState<number>(0);
  const [routes, setRoutes] = useState<TkRoutes[]>([]);
  const [task, setTask] = useState<ServicesTaskProps>(defaultTicketState);
  const [created, setCreated] = useState<ServicesCreatedProps>({});
  const [body, setBody] = useState<string>('');
  const [files, setFiles] = useState<DropzoneFile[]>([]);

  const { loading: loadingRoutes, data: dataRoutes, error: errorRoutes, refetch: refetchRoutes } = useQuery<
    Data<'TicketRoutes', TkRoutes[]>,
    void
  >(TICKETS_ROUTES, {
    ssr: false,
    fetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  });

  const [createTicket, { loading: loadingCreated, data: dataCreated, error: errorCreated }] = useMutation(
    TICKETS_TASK_NEW,
  );

  const contentRef = useRef(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef(null);

  const handleCurrentTab = (index: number): void => {
    setCurrentTab(index);
  };

  const handleTitle = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setTask({ ...task, title: event.target.value });
  };

  const handleResetTicket = (): void => {
    setTask(defaultTicketState);
    setBody('');
    setFiles([]);
    router.push(pathname, pathname);
  };

  const handleSubmit = (): void => {
    const { route, service } = task;

    const cleanedTitle = task.title.trim();
    const cleanedBody = body.trim();

    // TODO: продумать
    if (cleanedTitle.length < 10) {
      snackbarUtils.show(t('services:errors.smallTitle'));
      titleRef.current.focus();

      return;
    }
    if (cleanedBody.length < 10) {
      snackbarUtils.show(t('services:errors.smallBody'));
      // bodyRef.current.focus();

      return;
    }

    const variables = {
      ticket: {
        title: cleanedTitle,
        body: cleanedBody,
        serviceId: service ? service.code : null,
        categoryId: route ? route.code : null,
        categoryType: route ? route.categoryType : null,
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
      const { route, service } = query;
      const initialState = { ...defaultTicketState };
      const tab = 0;

      if (route) {
        // initialState.route = r.routes.forEach(() => routes.find((r) =>  => code === route);
        // if (initialState.department) {
        //   tab += 1;
        //   if (routes) {
        //     const currentService = routes.find((route) => route.routes.toString() === service);
        //     if (currentService) {
        //       tab += 1;
        //       // initialState.service = currentService;
        //       // setCategories(currentService.category);
        //       if (service) {
        //         // const currentCategory = currentService.category.find((cat) => cat.code === category);
        //         // if (currentCategory) {
        //         //   tab += 1;
        //         //   initialState.category = currentCategory;
        //         // }
        //       }
        //     } else if (service.indexOf('k', 0)) {
        //       return;
        //     }
        //   }
        // }
      }

      setCurrentTab(tab);
      setTask(initialState);
    }
  }, [routes, setTask, setCurrentTab, query]);

  useEffect(() => {
    if (currentTab === 3 && task.title.trim().length === 0 && titleRef.current) {
      titleRef.current.focus();
    }
  }, [currentTab, titleRef, task.title]);

  useEffect(() => {
    if (!loadingRoutes && !errorRoutes) {
      setRoutes(
        dataRoutes!.TicketsRoutes!.reduce((acc, srv) => {
          if (srv.error) {
            snackbarUtils.error(srv.error);
            return acc;
          }
          return srv ? [...acc, srv] : acc;
        }, [] as TkRoutes[]),
      );
    }
  }, [dataRoutes, errorRoutes, loadingRoutes]);

  useEffect(() => {
    setCreated(!loadingCreated && !errorCreated && dataCreated?.OldTicketNew);
  }, [dataCreated, errorCreated, loadingCreated]);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.updateHeight();
    }
  }, [contentRef, files]);

  useEffect(() => {
    if (errorCreated) {
      snackbarUtils.error(errorCreated);
    }
    if (errorRoutes) {
      snackbarUtils.error(errorRoutes);
    }
  }, [errorCreated, errorRoutes]);

  return (
    <>
      <Head>
        <title>
          {task.route
            ? t('services:title.category', {
                route: task.route?.name,
                service: task.service?.name,
              })
            : task.service
            ? t('services:title.service', {
                route: task.route?.name,
                service: task.service.name,
              })
            : task.route
            ? t('services:title.department', {
                route: task.route.name,
              })
            : t('services:title.title')}
        </title>
      </Head>
      <MaterialUI {...rest}>
        <ServicesComponent
          contentRef={contentRef}
          titleRef={titleRef}
          bodyRef={bodyRef}
          currentTab={currentTab}
          task={task}
          created={created}
          routes={routes}
          body={body}
          setBody={setBody}
          files={files}
          setFiles={setFiles}
          loadingRoutes={loadingRoutes}
          loadingCreated={loadingCreated}
          refetchRoutes={refetchRoutes}
          handleCurrentTab={handleCurrentTab}
          handleTitle={handleTitle}
          handleSubmit={handleSubmit}
          handleResetTicket={handleResetTicket}
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
