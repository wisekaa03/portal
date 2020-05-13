/** @format */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs } from '@storybook/addon-knobs';
import { withNextRouter } from 'storybook-addon-next-router';
import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

import { appWithTranslation, nextI18next } from '@lib/i18n-client';
import muiTheme from '@lib/theme';

const story = storiesOf('Services', module);

const withDecorator = (storyFn) => (
  <ThemeProvider theme={muiTheme}>
    <CssBaseline />
    {storyFn()}
  </ThemeProvider>
);

story.addDecorator(withKnobs);
story.addDecorator(withDecorator);
story.addDecorator(withNextRouter);

const withTranslation = (namespace, Component) => appWithTranslation(nextI18next.withTranslation(namespace)(Component));

export { story, withTranslation };
