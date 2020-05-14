/** @format */

import React, { FC } from 'react';
import { text } from '@storybook/addon-knobs';

import { ServicesElementProps } from '@lib/types';
import ServicesIcon from '@public/images/svg/icons/services.svg';
import { story, withTranslation } from './index.stories';
import Element from './element';

const Main: FC<ServicesElementProps> = ({ element }) => {
  return <Element element={element} />;
};

const Story = withTranslation('services', Main);

story.add('Element', () => (
  <Story
    element={{
      code: text('Code', '1'),
      name: text('Name', 'Департамент ИТ'),
      subtitle: text('Subtitle', 'текст'),
      avatar: ServicesIcon,
    }}
  />
));
