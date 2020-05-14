/** @format */

import React, { FC } from 'react';
import { text, date } from '@storybook/addon-knobs';

import { ServicesCreatedProps } from '@lib/types';
import { story, withTranslation } from './index.stories';
import Success from './success';

const Main: FC<ServicesCreatedProps> = (data) => {
  return <Success data={data} />;
};

const Story = withTranslation('services', Main);

story.add('Success', () => (
  <Story
    code={text('Код обращения', 'KfN-01661')}
    category={text('Услуга', '1C:Консолидация')}
    department={text('Департамент', 'Департамент ИТ')}
    createdDate={date('Дата', new Date())}
  />
));
