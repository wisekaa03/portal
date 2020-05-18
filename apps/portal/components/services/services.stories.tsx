/** @format */

import React, { FC, useState, useRef, useCallback, useEffect } from 'react';
import { action } from '@storybook/addon-actions';
import { boolean } from '@storybook/addon-knobs';

import {
  ServicesTicketProps,
  ServicesCreatedProps,
  DropzoneFile,
  TicketsElementProps,
  ServicesWrapperProps,
} from '@lib/types';
import ServicesIcon from '@public/images/svg/icons/services.svg';
import { TkRoutes, TkWhere, TkRoute } from '@lib/types/tickets';
import { story, withTranslation } from './index.stories';
import Services from './index';

const mockFavorites: TkRoute[] = [
  {
    where: TkWhere.SvcDefault,
    code: '1',
    name: 'Сервис 1',
    avatar: ServicesIcon,
    services: [
      {
        where: TkWhere.SvcDefault,
        code: '4',
        name: 'Не работает',
      },
      {
        where: TkWhere.SvcDefault,
        code: '5',
        name: 'Заказать услугу',
      },
    ],
  },
  {
    where: TkWhere.SvcDefault,
    code: '2',
    name: 'Сервис 2',
    avatar: ServicesIcon,
  },
  {
    where: TkWhere.SvcDefault,
    code: '3',
    name: 'Сервис 3',
    avatar: ServicesIcon,
  },
];

const mockRoutes: TkRoutes[] = [
  {
    categories: [...mockFavorites],
  },
];

const defaultTicketState: ServicesTicketProps = { route: mockFavorites[0] };

const Story: FC<ServicesWrapperProps> = withTranslation('services', Services);

story.add('Default View', () => {
  const [currentTab, setCurrentTab] = useState<number>(0);
  const [task, setTask] = useState<ServicesTicketProps>(defaultTicketState);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [created, setCreated] = useState<ServicesCreatedProps>({});
  const [routes, setRoutes] = useState<TkRoutes[]>(mockRoutes);
  const [favorites, setFavorites] = useState<TicketsElementProps[]>(mockFavorites);
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
      handleFavorites={action('Favorites')}
    />
  );
});
