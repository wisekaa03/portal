/** @format */

import React from 'react';
import { text } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';

import { story, withTranslation } from './index.stories';
import ServicesError from './error';

const Story = withTranslation('services', ServicesError);

story.add('Error', () => <Story name={text('DB Name', 'OS_TICKET')} onClose={action('Close')} />);
