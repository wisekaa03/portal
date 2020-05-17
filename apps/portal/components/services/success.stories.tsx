/** @format */

import React from 'react';
import { text, date } from '@storybook/addon-knobs';

import { story, withTranslation } from './index.stories';
import Success from './success';

const Story = withTranslation('services', Success);

story.add('Success', () => (
  <Story
    data={{
      code: text('Код обращения', 'KfN-01661'),
      service: text('Сервис', '1C:Консолидация'),
      category: text('Услуга', 'Не работает'),
      createdDate: date('Дата', new Date()),
    }}
  />
));
