/** @format */

//#region Imports NPM
import React, { useState, useEffect, useMemo, useRef, useCallback, useContext, Component } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useQuery, useMutation, ApolloQueryResult } from '@apollo/client';
//#endregion
//#region Imports Local
import { ProfileContext } from '@lib/context';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '@lib/i18n-client';
import { MINIMAL_SUBJECT_LENGTH, MINIMAL_BODY_LENGTH } from '@lib/constants';
import { USER_SETTINGS, TICKETS_ROUTES, TICKETS_TASK_NEW, TICKETS_ROUTES_SUB } from '@lib/queries';
import {
  Data,
  DropzoneFile,
  ServicesTaskProps,
  ServicesCreatedProps,
  TkRoutes,
  UserSettings,
  UserSettingsTaskFavoriteFull,
  UserSettingsTaskFavorite,
  TkRoute,
  TkTaskNew,
} from '@lib/types';
import snackbarUtils from '@lib/snackbar-utils';
import TicketsComponent from '@front/components/tickets';
import { MaterialUI } from '@front/layout';
import { TkRoutesInput } from '../lib/types/tickets';

//#endregion

const TicketsPage: I18nPage = ({ t, pathname, query, ...rest }): React.ReactElement => {
  const router = useRouter();

  const [currentTab, setCurrentTab] = useState<number>(0);
  const [routes, setRoutes] = useState<TkRoute[]>([]);
  const [task, setTask] = useState<ServicesTaskProps>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [created, setCreated] = useState<ServicesCreatedProps>({});
  const [subject, setSubject] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [files, setFiles] = useState<DropzoneFile[]>([]);

  const me = useContext(ProfileContext);
  const favorites = useMemo(() => me?.user?.settings?.task?.favorites || [], [me]);

  const [userSettings, { loading: loadingSettings, error: errorSettings }] = useMutation<UserSettings, { value: UserSettings }>(
    USER_SETTINGS,
  );

  const {
    loading: loadingRoutes,
    data: dataRoutes,
    error: errorRoutes,
    refetch: refetchRoutesInt,
    subscribeToMore: subscribeTicketsRoutes,
  } = useQuery<Data<'ticketsRoutes', TkRoutes>, { routes: TkRoutesInput }>(TICKETS_ROUTES, {
    ssr: true,
    fetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    if (typeof subscribeTicketsRoutes === 'function') {
      subscribeTicketsRoutes({
        document: TICKETS_ROUTES_SUB,
        updateQuery: (prev, { subscriptionData: { data } }) => {
          const updateData = data.ticketsRoutes;

          return { ticketsRoutes: updateData };
        },
      });
    }
  }, [subscribeTicketsRoutes]);

  const refetchRoutes = async (
    variables?: Partial<{
      routes: TkRoutesInput;
    }>,
  ): Promise<ApolloQueryResult<Data<'ticketsRoutes', TkRoutes>>> => refetchRoutesInt({ routes: { ...variables?.routes, cache: false } });

  const [createTask, { loading: loadingCreated, data: dataCreated, error: errorCreated }] = useMutation<Data<'ticketsTaskNew', TkTaskNew>>(
    TICKETS_TASK_NEW,
    // {
    //   refetchQueries: [
    //     {
    //       query: TICKETS_TASKS,
    //     },
    //   ],
    //   awaitRefetchQueries: true,
    // },
  );

  const contentRef = useRef(null);
  const serviceRef = useRef<HTMLSelectElement>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const handleService = useCallback(
    async (event: React.ChangeEvent<HTMLSelectElement>): Promise<void> => {
      const service = task.route?.services?.find((srv) => srv?.code === event.target.value) || undefined;
      setTask({ ...task, service });
    },
    [task],
  );

  const handleResetTicket = useCallback(async (): Promise<void> => {
    setTask({});
    setBody('');
    setFiles([]);
    setCurrentTab(0);
    setSubmitted(false);
    router.push(pathname || '/tickets', pathname);
  }, [router, pathname, setTask, setBody, setFiles, setCurrentTab, setSubmitted]);

  const handleCurrentTab = useCallback(
    async (tab) => {
      if (tab === 0) {
        handleResetTicket();
      }
      setCurrentTab(tab);
    },
    [setCurrentTab, handleResetTicket],
  );

  const handleFavorites = useCallback(
    async (data) => {
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
      snackbarUtils.show(t('tickets:errors.smallSubject'));
      if (subjectRef.current) subjectRef.current.focus();

      return;
    }

    const cleanedBody = body.trim();
    if (cleanedBody.length < MINIMAL_BODY_LENGTH) {
      snackbarUtils.show(t('tickets:errors.smallBody'));
      // bodyRef.current.focus();

      return;
    }

    const variables = {
      task: {
        where: service?.where,
        subject,
        body: cleanedBody,
        route: route?.code,
        service: service?.code,
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
    if (query && Array.isArray(routes) && routes.length > 0) {
      const { where, route: routeCode, service: serviceCode } = query;
      if (where && routeCode) {
        const route = routes.find((element) => element.where === where && element.code === routeCode);
        if (route && Object.keys(route).length > 0) {
          const service =
            (serviceCode ? route.services?.find((s) => s.code === serviceCode) : route.services?.find((s) => s.name === 'Прочее')) ||
            undefined;
          setTask({ route, service });
          setCurrentTab(1);
          return;
        }
        handleResetTicket();
      }
    }
  }, [routes, setTask, setCurrentTab, handleResetTicket, query]);

  useEffect(() => {
    if (!loadingRoutes && !errorRoutes && dataRoutes?.ticketsRoutes) {
      if (dataRoutes.ticketsRoutes.errors) {
        dataRoutes.ticketsRoutes.errors?.forEach((error) => snackbarUtils.error(error));
      }
      if (dataRoutes.ticketsRoutes.routes) {
        setRoutes(dataRoutes.ticketsRoutes.routes);
      }
    }
  }, [dataRoutes, errorRoutes, loadingRoutes]);

  useEffect(() => {
    if (dataCreated && dataCreated.ticketsTaskNew && !loadingCreated && !errorCreated) {
      setCreated(dataCreated.ticketsTaskNew);
    }
  }, [dataCreated, errorCreated, loadingCreated]);

  // useEffect(() => {
  //   if (contentRef.current) {
  //     contentRef.current.updateHeight();
  //   }
  // }, [contentRef, files]);

  useEffect(() => {
    if (errorCreated) {
      snackbarUtils.error(errorCreated);
      setCreated({});
    }
    if (errorRoutes) {
      snackbarUtils.error(errorRoutes);
    }
    if (errorSettings) {
      snackbarUtils.error(errorSettings);
    }
  }, [errorCreated, errorRoutes, errorSettings]);

  const allFavorites = useMemo<UserSettingsTaskFavoriteFull[]>(() => {
    if (Array.isArray(favorites) && favorites.length > 0) {
      return favorites.reduce((accumulator, favorite) => {
        const route = routes?.find((r) => r?.where === favorite?.where && r?.code === favorite?.code);
        if (route) {
          const service = route?.services?.find((s) => s?.code === favorite?.svcCode);
          if (service) {
            return [
              ...accumulator,
              {
                route,
                service,
              },
            ];
          }
        }

        return accumulator;
      }, [] as UserSettingsTaskFavoriteFull[]);
    }

    return [];
  }, [routes, favorites]);

  return (
    <>
      <Head>
        <title>{task.route ? t('tickets:title.route', { route: task.route.name }) : t('tickets:title.title')}</title>
      </Head>
      <MaterialUI refetchComponent={refetchRoutes} {...rest}>
        <TicketsComponent
          contentRef={contentRef}
          serviceRef={serviceRef}
          bodyRef={bodyRef}
          subjectRef={subjectRef}
          currentTab={currentTab}
          task={task}
          created={created}
          errorCreated={errorCreated}
          routes={routes}
          favorites={allFavorites}
          subject={subject}
          setSubject={setSubject}
          body={body}
          setBody={setBody}
          files={files}
          setFiles={setFiles}
          submitted={submitted}
          loadingRoutes={loadingRoutes}
          loadingCreated={loadingCreated}
          loadingSettings={loadingSettings}
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

TicketsPage.getInitialProps = ({ pathname, query }) => ({
  pathname,
  query,
  namespacesRequired: includeDefaultNamespaces(['tickets']),
});

export default nextI18next.withTranslation('tickets')(TicketsPage);
