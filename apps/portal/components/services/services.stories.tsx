/** @format */

import React, { FC, useState, useRef, useCallback, useEffect } from 'react';
import { action } from '@storybook/addon-actions';
import { boolean, text } from '@storybook/addon-knobs';

import {
  ServicesTaskProps,
  ServicesCreatedProps,
  DropzoneFile,
  ServicesWrapperProps,
  TkRoutes,
  TkWhere,
  TkRoute,
  UserSettingsTaskFavorite,
} from '@lib/types';
import ServicesIcon from '@public/images/svg/icons/services.svg';
import { story, withTranslation } from './index.stories';
import Services from './index';

const mockRoutes: TkRoute[] = [
  {
    where: TkWhere.Default,
    code: '1',
    name: 'Сервис 1',
    avatar: ServicesIcon,
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
    avatar: ServicesIcon,
  },
  {
    where: TkWhere.Default,
    code: '3',
    name: 'Сервис 3',
    avatar: ServicesIcon,
  },
];

const mockFavorites: UserSettingsTaskFavorite[] = [
  { id: '1', where: TkWhere.SOAP1C, priority: 1 },
  { id: '3', where: TkWhere.SOAP1C, priority: 0 },
  { id: '2', where: TkWhere.SOAP1C, priority: 2 },
];

const defaultTicketState: ServicesTaskProps = { route: mockRoutes[0] };

const Story: FC<ServicesWrapperProps> = withTranslation('services', Services);

story.add('Default View', () => {
  const mockData: TkRoutes[] = [
    {
      routes: [...mockRoutes],
      error: text('Error DB', 'OS_TICKET'),
    },
  ];

  const [currentTab, setCurrentTab] = useState<number>(0);
  const [task, setTask] = useState<ServicesTaskProps>(defaultTicketState);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [created, setCreated] = useState<ServicesCreatedProps>({});
  const [routes, setRoutes] = useState<TkRoutes[]>(mockData);
  const [favorites, setFavorites] = useState<UserSettingsTaskFavorite[]>(mockFavorites);
  const [body, setBody] = useState<string>('');
  const [files, setFiles] = useState<DropzoneFile[]>([]);

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

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.updateHeight();
    }
  }, [contentRef, files]);

  return (
    <Story
      contentRef={contentRef}
      serviceRef={serviceRef}
      bodyRef={bodyRef}
      currentTab={currentTab}
      task={task}
      created={created}
      routes={routes}
      favorites={showFavorites ? favorites : []}
      body={body}
      setBody={setBody}
      files={files}
      setFiles={setFiles}
      submitted={submitted}
      loadingRoutes={boolean('Loading Routes', false)}
      loadingCreated={boolean('Loading Created', false)}
      refetchRoutes={() => action('Refetch Routes')() as any}
      handleCurrentTab={setCurrentTab}
      handleService={handleService}
      handleSubmit={handleSubmit}
      handleResetTicket={handleResetTicket}
      handleFavorites={setFavorites}
    />
  );
});
