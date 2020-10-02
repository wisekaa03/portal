/** @format */

import React from 'react';
import { text, boolean } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';

import Service1 from '@public/images/svg/example/app_1.svg';
import Service2 from '@public/images/svg/example/app_2.svg';
import { story, withTranslation } from './index.stories';
import element from './element';

const Story = withTranslation('tickets', element);

story.add('Element', () => (
  <>
    <Story
      element={{
        code: text('Code1', '1'),
        name: text('Name1', 'Сервис 1'),
        subtitle: text('Subtitle1', ''),
        avatar: Service1,
      }}
      favorite
      setFavorite={action('Favorite')}
      isUp={!boolean('is FirstElement', false)}
      isDown={!boolean('is LastElement', false)}
    />
    <Story
      element={{
        code: text('Code2', '2'),
        name: text('Name2', 'Сервис 2'),
        subtitle: text('Subtitle2', 'подзаголовок'),
        avatar: Service2,
      }}
      favorite={false}
    />
  </>
));
