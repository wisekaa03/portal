/** @format */

import React, { FC, useState, useRef, useCallback, useEffect } from 'react';
import { action } from '@storybook/addon-actions';
import { boolean, text } from '@storybook/addon-knobs';

import type {
  ServicesTaskProps,
  ServicesCreatedProps,
  DropzoneFile,
  TicketsWrapperProps,
  TkRoutes,
  TkRoute,
  UserSettingsTaskFavorite,
  UserSettingsTaskFavoriteFull,
} from '@lib/types';
import { TkWhere } from '@lib/types/tickets';
import TicketsIcon from '@public/images/svg/drawer/tickets.svg';
import { story, withTranslation } from './index.stories';
import Tickets from '.';

const mockRoutes: TkRoute[] = [
  {
    where: TkWhere.Default,
    code: '1',
    name: 'Сервис 1',
    avatar: TicketsIcon,
    services: [
      {
        where: TkWhere.Default,
        code: '4',
        name: 'Не работает',
      },
      {
        where: TkWhere.Default,
        code: '5',
        name: 'Заказать услугу',
      },
    ],
  },
  {
    where: TkWhere.Default,
    code: '2',
    name: 'Сервис 2',
    avatar: TicketsIcon,
    services: [],
  },
  {
    where: TkWhere.Default,
    code: '3',
    name: 'Сервис 3',
    avatar: TicketsIcon,
    services: [],
  },
];

const mockFavorites: UserSettingsTaskFavorite[] = [
  { code: '1', where: TkWhere.SOAP1C, svcCode: '0000001' },
  { code: '2', where: TkWhere.SOAP1C, svcCode: '0000002' },
  { code: '3', where: TkWhere.SOAP1C, svcCode: '0000003' },
];

const mockFavoritesFull: UserSettingsTaskFavoriteFull[] = [
  {
    route: { code: '1', where: TkWhere.SOAP1C, name: 'Route Name 00001' },
    service: { where: TkWhere.SOAP1C, code: '0000001', name: 'Service Name 00001' },
  },
  {
    route: { code: '2', where: TkWhere.SOAP1C, name: 'Route Name 00002' },
    service: { where: TkWhere.SOAP1C, code: '0000002', name: 'Service Name 00002' },
  },
  {
    route: { code: '3', where: TkWhere.SOAP1C, name: 'Route Name 00003' },
    service: { where: TkWhere.SOAP1C, code: '0000003', name: 'Service Name 00003' },
  },
];

const defaultTicketState: ServicesTaskProps = { route: mockRoutes[0] };

const Story: FC<TicketsWrapperProps> = withTranslation('tickets', Tickets);

story.add('Default View', () => {
  const mockData: TkRoutes = {
    routes: [...mockRoutes],
    errors: [text('Error DB', 'OS_TICKET')],
  };
  const [currentTab, setCurrentTab] = useState<number>(0);
  const [task, setTask] = useState<ServicesTaskProps>(defaultTicketState);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [created, setCreated] = useState<ServicesCreatedProps>({});
  const [routes, setRoutes] = useState<TkRoute[]>(mockRoutes);
  const [favorites, setFavorites] = useState<UserSettingsTaskFavoriteFull[]>(mockFavoritesFull);
  const [subject, setSubject] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [files, setFiles] = useState<DropzoneFile[]>([]);

  const contentRef = useRef(null);
  const serviceRef = useRef<HTMLSelectElement>(null);
  const subjectRef = useRef(null);
  const bodyRef = useRef(null);

  const handleService = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>): void => {
      const service = task.route?.services?.find((srv) => srv?.code === event.target.value) ?? undefined;
      setTask({ ...task, service });
    },
    [task],
  );

  const handleResetTicket = useCallback((): void => {
    action('Ticket reset')();
    setTask(defaultTicketState);
    setBody('');
    setFiles([]);
    setCurrentTab(0);
    setSubmitted(false);
  }, []);

  const handleSubmit = useCallback((): void => {
    setSubmitted(true);
    action('Submit')({
      task,
      body,
      files,
    });
  }, [task, body, files]);

  const showFavorites = boolean('Show Favorites', true);
  const errorCreated = undefined;
  const query = {};

  useEffect(() => {
    if (contentRef.current) {
      (contentRef.current as any).updateHeight();
    }
  }, [contentRef, files]);

  return (
    <Story
      contentRef={contentRef}
      serviceRef={serviceRef}
      subjectRef={subjectRef}
      bodyRef={bodyRef}
      currentTab={currentTab}
      task={task}
      created={created}
      errorCreated={errorCreated}
      routes={routes}
      favorites={showFavorites ? favorites : []}
      subject={subject}
      setSubject={setSubject}
      body={body}
      setBody={setBody}
      files={files}
      setFiles={setFiles}
      submitted={submitted}
      loadingSettings={boolean('Loading Settings', false)}
      loadingRoutes={boolean('Loading Routes', false)}
      loadingCreated={boolean('Loading Created', false)}
      handleCurrentTab={setCurrentTab}
      handleService={handleService}
      handleSubmit={handleSubmit}
      handleResetTicket={handleResetTicket}
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      handleFavorites={(): void => {}}
    />
  );
});
