/** @format */

// #region Imports NPM
import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useQuery, useMutation } from '@apollo/react-hooks';
// #endregion
// #region Imports Local
import { includeDefaultNamespaces, nextI18next, I18nPage } from '@lib/i18n-client';
import { Data, DropzoneFile, ServicesTicketProps, ServicesCreatedProps, OldService, OldCategory } from '@lib/types';
import { OLD_TICKET_SERVICE, OLD_TICKET_NEW } from '@lib/queries';
import snackbarUtils from '@lib/snackbar-utils';
import ServicesIcon from '@public/images/svg/icons/services.svg';
import ServicesComponent from '@front/components/services';
import { MaterialUI } from '@front/layout';
// #endregion

const departments = [
  {
    code: 'IT',
    name: 'Департамент ИТ',
    avatar: ServicesIcon,
  },
];

const defaultTicketState: ServicesTicketProps = { title: '' };

const ServicesPage: I18nPage = ({ t, pathname, query, ...rest }): React.ReactElement => {
  const router = useRouter();

  const [currentTab, setCurrentTab] = useState<number>(0);
  const [services, setServices] = useState<OldService[]>([]);
  const [categories, setCategories] = useState<OldCategory[]>([]);
  const [ticket, setTicket] = useState<ServicesTicketProps>(defaultTicketState);
  const [created, setCreated] = useState<ServicesCreatedProps>({});
  const [body, setBody] = useState<string>('');
  const [files, setFiles] = useState<DropzoneFile[]>([]);

  const { loading: loadingServices, data: dataServices, error: errorServices, refetch: refetchServices } = useQuery<
    Data<'OldTicketService', OldService[]>,
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
  const titleRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef(null);

  const handleCurrentTab = (index: number): void => {
    setCurrentTab(index);
  };

  const handleTitle = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setTicket({ ...ticket, title: event.target.value });
  };

  const handleResetTicket = (): void => {
    setTicket(defaultTicketState);
    setCategories([]);
    setBody('');
    setFiles([]);
    router.push(pathname, pathname);
  };

  const handleSubmit = (): void => {
    const { service, category } = ticket;

    const cleanedTitle = ticket.title.trim();
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
        categoryId: category ? category.code : null,
        categoryType: category ? category.categoryType : null,
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
    if (!__SERVER__ && services) {
      const { department, service, category } = query;
      const initialState = { ...defaultTicketState };
      let tab = 0;

      if (department) {
        initialState.department = departments.find((dep) => dep.code === department);

        if (initialState.department) {
          tab += 1;

          if (service) {
            const currentService = services.find((ser) => ser.code === service);

            if (currentService) {
              tab += 1;
              initialState.service = currentService;

              setCategories(currentService.category);

              if (category) {
                const currentCategory = currentService.category.find((cat) => cat.code === category);

                if (currentCategory) {
                  tab += 1;
                  initialState.category = currentCategory;
                }
              }
            } else if (service === 'k0001') {
              return;
            }
          }
        }
      }

      setCurrentTab(tab);
      setTicket(initialState);
    }
  }, [services, setTicket, setCurrentTab, query]);

  useEffect(() => {
    if (currentTab === 3 && ticket.title.trim().length === 0 && titleRef.current) {
      titleRef.current.focus();
    }
  }, [currentTab, titleRef, ticket.title]);

  useEffect(() => {
    setServices((!loadingServices && !errorServices && dataServices?.OldTicketService) || []);
  }, [dataServices, errorServices, loadingServices]);

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
    if (errorServices) {
      snackbarUtils.error(errorServices);
    }
  }, [errorCreated, errorServices]);

  return (
    <>
      <Head>
        <title>
          {ticket.category
            ? t('services:title.category', {
                department: ticket.department?.name,
                service: ticket.service?.name,
                category: ticket.category.name,
              })
            : ticket.service
            ? t('services:title.service', {
                department: ticket.department?.name,
                service: ticket.service.name,
              })
            : ticket.department
            ? t('services:title.department', {
                department: ticket.department.name,
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
          ticket={ticket}
          created={created}
          departments={departments}
          services={services}
          categories={categories}
          body={body}
          setBody={setBody}
          files={files}
          setFiles={setFiles}
          loadingServices={loadingServices}
          loadingCreated={loadingCreated}
          refetchServices={refetchServices}
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
