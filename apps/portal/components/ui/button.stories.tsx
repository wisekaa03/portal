/** @format */

import React from 'react';
import { text } from '@storybook/addon-knobs';
import { Box } from '@material-ui/core';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

import { story } from './index.stories';
import Button from './button';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      'display': 'flex',
      'flexDirection': 'column',

      '& button': {
        width: 'fit-content',
      },

      '& button:not(:first-child)': {
        marginTop: theme.spacing(),
      },
    },
  }),
);

story.add('Button', () => {
  const classes = useStyles({});

  return (
    <Box className={classes.root}>
      <Button actionType="accept">{text('Accept', 'Принять')}</Button>
      <Button actionType="close">{text('Close', 'Закрыть')}</Button>
      <Button actionType="cancel">{text('Cancel', 'Отменить')}</Button>
      <Button actionType="save">{text('Save', 'Сохранить')}</Button>
      <Button actionType="print">{text('Print', 'Печать')}</Button>
      <Button actionType="reset">{text('Reset', 'Сбросить')}</Button>
      <Button actionType="favorite">{text('Favorite', 'Добавить в избранное')}</Button>
    </Box>
  );
});
