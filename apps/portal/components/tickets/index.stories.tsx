/** @format */

import React from 'react';
import { Namespace } from 'react-i18next';
import { WithTranslation } from 'next-i18next';
import { storiesOf } from '@storybook/react';
import { StoryApi, StoryFn } from '@storybook/addons';
import { withKnobs } from '@storybook/addon-knobs';
import { withNextRouter } from 'storybook-addon-next-router';
import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { Box } from '@material-ui/core';

import { appWithTranslation, nextI18next } from '@lib/i18n-client';
import { FONT_SIZE_NORMAL } from '@lib/constants';
import { MaterialUI } from '@lib/theme';

const story = storiesOf('Services', module);

const withDecorator = (storyFn: StoryFn<React.ReactNode>) => (
  <ThemeProvider theme={MaterialUI(FONT_SIZE_NORMAL)}>
    <CssBaseline />
    {storyFn()}
  </ThemeProvider>
);

const withCenter = (storyFn: StoryFn<React.ReactNode>) => <Box>{storyFn()}</Box>;

story.addDecorator(withKnobs);
story.addDecorator(withDecorator);
story.addDecorator(withNextRouter);
story.addDecorator(withCenter);

function withTranslation<T>(
  namespace: Namespace,
  Component: React.ComponentType<T>,
): React.ComponentType<T> | StoryFn<React.ComponentType<T>> | any {
  return appWithTranslation(nextI18next.withTranslation(namespace)((Component as unknown) as React.ComponentType<T & WithTranslation>));
}

export { story, withTranslation };
