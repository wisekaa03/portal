/** @format */

import React, { useState, useRef, useCallback } from 'react';
import { action } from '@storybook/addon-actions';
import { boolean } from '@storybook/addon-knobs';

import { ServicesTicketProps, ServicesCreatedProps, OldService, DropzoneFile } from '@lib/types';
import ServicesIcon from '@public/images/svg/icons/services.svg';
import { story, withTranslation } from './index.stories';
import Services from './index';

const defaultTicketState: ServicesTicketProps = { title: '' };

const departments = [
  {
    code: 'IT',
    name: 'Департамент ИТ',
    avatar: ServicesIcon,
  },
];

const Story = withTranslation('services', Services);

story.add('Default View', () => {
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
    <Story
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
      loadingServices={boolean('Loading Services', false)}
      loadingCreated={boolean('Loading Created', false)}
      refetchServices={action('Refetch') as any}
      handleCurrentTab={handleCurrentTab}
      handleTitle={handleTitle}
      handleSubmit={action('Submit')}
      handleResetTicket={handleResetTicket}
    />
  );
});
