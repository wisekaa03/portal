/** @format */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs } from '@storybook/addon-knobs';
import { withNextRouter } from 'storybook-addon-next-router';
import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { Box } from '@material-ui/core';

import { appWithTranslation, nextI18next } from '@lib/i18n-client';
import { MaterialUI_fck } from '@lib/theme';

const story = storiesOf('Services', module);

const withDecorator = (storyFn) => (
  <ThemeProvider theme={MaterialUI_fck(16)}>
    <CssBaseline />
    {storyFn()}
  </ThemeProvider>
);

const withCenter = (storyFn) => <Box p={2}>{storyFn()}</Box>;

story.addDecorator(withKnobs);
story.addDecorator(withDecorator);
story.addDecorator(withNextRouter);
story.addDecorator(withCenter);

const withTranslation = (namespace, Component) => appWithTranslation(nextI18next.withTranslation(namespace)(Component));

export { story, withTranslation };
