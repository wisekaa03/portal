/** @format */

import React, { useState, useRef, useCallback, FC } from 'react';
import { action } from '@storybook/addon-actions';
import { boolean } from '@storybook/addon-knobs';

import { story, withTranslation } from '@lib/index.stories';
import { ServicesTicketProps, ServicesCreatedProps, OldService, DropzoneFile } from '@lib/types';
import Services from '@front/components/services';
import ServicesIcon from '@public/images/svg/icons/services.svg';

const defaultTicketState: ServicesTicketProps = { title: '' };

const departments = [
  {
    code: 'IT',
    name: 'Департамент ИТ',
    avatar: ServicesIcon,
  },
];

type MainProps = {
  loadingServices: boolean;
  loadingCreated: boolean;
};

const Main: FC<MainProps> = ({ loadingServices, loadingCreated }) => {
  const [currentTab, setCurrentTab] = useState<number>(0);
  const [ticket, setTicket] = useState<ServicesTicketProps>(defaultTicketState);
  const [created, setCreated] = useState<ServicesCreatedProps>({});
  const [services, setServices] = useState<OldService[]>([]);
  const [body, setBody] = useState<string>('');
  const [files, setFiles] = useState<DropzoneFile[]>([]);

  const contentRef = useRef(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef(null);

  const handleCurrentTab = useCallback((index: number): void => {
    setCurrentTab(index);
  }, []);

  const handleTitle = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      setTicket({ ...ticket, title: event.target.value });
    },
    [ticket],
  );

  const handleResetTicket = useCallback((): void => {
    setTicket(defaultTicketState);
    setBody('');
    setFiles([]);
  }, []);

  return (
    <Services
      contentRef={contentRef}
      titleRef={titleRef}
      bodyRef={bodyRef}
      currentTab={currentTab}
      ticket={ticket}
      created={created}
      departments={departments}
      services={services}
      body={body}
      setBody={setBody}
      files={files}
      setFiles={setFiles}
      loadingServices={loadingServices}
      loadingCreated={loadingCreated}
      refetchServices={action('Refetch') as any}
      handleCurrentTab={handleCurrentTab}
      handleTitle={handleTitle}
      handleSubmit={action('Submit')}
      handleResetTicket={handleResetTicket}
    />
  );
};

const Story = withTranslation('services', Main);

story.add('Default View', () => (
  <Story loadingServices={boolean('Loading Services', false)} loadingCreated={boolean('Loading Created', false)} />
));
