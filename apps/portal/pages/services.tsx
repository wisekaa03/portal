/** @format */
/* eslint import/no-default-export: 0 */

//#region Imports NPM
import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useQuery, useMutation } from '@apollo/react-hooks';
//#endregion
//#region Imports Local
import { includeDefaultNamespaces, nextI18next, I18nPage } from '@lib/i18n-client';
import { MINIMAL_SUBJECT_LENGTH, MINIMAL_BODY_LENGTH } from '@lib/constants';
import { Data, DropzoneFile, ServicesTaskProps, ServicesCreatedProps, TkRoutes, UserSettings } from '@lib/types';
import snackbarUtils from '@lib/snackbar-utils';
import ServicesComponent from '@front/components/services';
import { MaterialUI } from '@front/layout';
import { ProfileContext } from '@lib/context';
import { USER_SETTINGS, TICKETS_ROUTES, TICKETS_TASK_NEW } from '@lib/queries';
import { TkRoute, TkTaskNew } from '@lib/types/tickets';
//#endregion

const ServicesPage: I18nPage = ({ t, pathname, query, ...rest }): React.ReactElement => {
  const router = useRouter();

  const [currentTab, setCurrentTab] = useState<number>(0);
  const [routes, setRoutes] = useState<TkRoutes[]>([]);
  const [task, setTask] = useState<ServicesTaskProps>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [created, setCreated] = useState<ServicesCreatedProps>({});
  const [subject, setSubject] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [files, setFiles] = useState<DropzoneFile[]>([]);

  const me = useContext(ProfileContext);

  const favorites = me?.user?.settings?.task?.favorites || [];

  const [userSettings, { error: errorSettings }] = useMutation<UserSettings, { value: UserSettings }>(USER_SETTINGS);

  const { loading: loadingRoutes, data: dataRoutes, error: errorRoutes, refetch: refetchRoutes } = useQuery<
    Data<'TicketsRoutes', TkRoutes[]>,
    void
  >(TICKETS_ROUTES, {
    ssr: false,
    fetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  });

  const [createTask, { loading: loadingCreated, data: dataCreated, error: errorCreated }] = useMutation<
    Data<'TicketsTaskNew', TkTaskNew>
  >(TICKETS_TASK_NEW);

  const contentRef = useRef(null);
  const serviceRef = useRef<HTMLSelectElement>(null);
  const subjectRef = useRef(null);
  // const bodyRef = useRef(null);

  const handleService = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>): void => {
      const service = task.route?.services?.find(({ code }) => code === event.target.value);
      setTask({ ...task, service });
    },
    [task],
  );

  const handleResetTicket = useCallback((): void => {
    setTask({});
    setBody('');
    setFiles([]);
    setCurrentTab(0);
    setSubmitted(false);
    router.push(pathname, pathname);
  }, [router, pathname, setTask, setBody, setFiles, setCurrentTab, setSubmitted]);

  const handleCurrentTab = useCallback(
    (tab) => {
      if (tab === 0) {
        handleResetTicket();
      }
      setCurrentTab(tab);
    },
    [setCurrentTab, handleResetTicket],
  );

  const handleFavorites = useCallback(
    (data) => {
      userSettings({
        variables: {
          value: { task: { favorites: data } },
        },
      });
    },
    [userSettings],
  );

  const handleSubmit = (): void => {
    const { route, service } = task;

    if (subject.length < MINIMAL_SUBJECT_LENGTH) {
      snackbarUtils.show(t('services:errors.smallSubject'));
      subjectRef.current.focus();

      return;
    }

    const cleanedBody = body.trim();
    if (cleanedBody.length < MINIMAL_BODY_LENGTH) {
      snackbarUtils.show(t('services:errors.smallBody'));
      // bodyRef.current.focus();

      return;
    }

    const variables = {
      task: {
        where: service.where,
        subject,
        body: cleanedBody,
        route: route.code,
        service: service.code,
      },
      attachments: files.map((file: DropzoneFile) => file.file),
    };

    createTask({
      variables,
    });

    setCreated({});
    setSubmitted(true);
  };

  useEffect(() => {
    if (!__SERVER__ && routes) {
      const { where, route, service } = query;
      if (where && route && routes.length > 0) {
        const rt = routes.reduce(
          (acc, val) => ({ ...acc, ...val.routes?.find((v) => v.code === route && v.where === where) }),
          {} as TkRoute,
        );
        console.error('Routes', rt);
        if (typeof rt === 'object' && rt !== null) {
          const tService = rt.services?.find(({ code: srvCode }) => srvCode === service);
          console.error('Service', tService);
          setTask({ route: rt, service: tService });
          setCurrentTab(1);
          // serviceRef.current.
        } else {
          handleResetTicket();
        }
      }
    }
  }, [routes, setTask, setCurrentTab, handleResetTicket, query]);

  useEffect(() => {
    if (!loadingRoutes && !errorRoutes && typeof dataRoutes === 'object') {
      setRoutes(
        dataRoutes.TicketsRoutes?.reduce((acc, srv) => {
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
    setCreated(!loadingCreated && !errorCreated && dataCreated?.TicketsTaskNew);
  }, [dataCreated?.TicketsTaskNew, errorCreated, loadingCreated]);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.updateHeight();
    }
  }, [contentRef, files]);

  useEffect(() => {
    if (errorCreated) {
      snackbarUtils.error(errorCreated);
      setCreated({});
    }
    if (errorRoutes) {
      snackbarUtils.error(errorRoutes);
    }
  }, [errorCreated, errorRoutes]);

  return (
    <>
      <Head>
        <title>{task.route ? t('services:title.route', { route: task.route.name }) : t('services:title.title')}</title>
      </Head>
      <MaterialUI {...rest}>
        <ServicesComponent
          contentRef={contentRef}
          serviceRef={serviceRef}
          query={query}
          // bodyRef={bodyRef}
          subjectRef={subjectRef}
          currentTab={currentTab}
          refetchRoutes={refetchRoutes}
          task={task}
          created={created}
          errorCreated={errorCreated}
          routes={routes}
          favorites={favorites}
          subject={subject}
          setSubject={setSubject}
          body={body}
          setBody={setBody}
          files={files}
          setFiles={setFiles}
          submitted={submitted}
          loadingRoutes={loadingRoutes}
          loadingCreated={loadingCreated}
          handleCurrentTab={handleCurrentTab}
          handleService={handleService}
          handleSubmit={handleSubmit}
          handleResetTicket={handleResetTicket}
          handleFavorites={handleFavorites}
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
