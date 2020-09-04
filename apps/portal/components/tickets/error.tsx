/** @format */

//#region Imports NPM
import React, { FC } from 'react';
import { ApolloError } from '@apollo/client';
import { Typography, Card, CardContent, CardActions } from '@material-ui/core';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
//#endregion
//#region Imports Local
import { ServicesErrorProps } from '@lib/types';
import { useTranslation } from '@lib/i18n-client';
import Button from '@front/components/ui/button';
//#endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '90vw',
      maxWidth: '600px',
      borderRadius: theme.shape.borderRadius,
      boxShadow: '0px 19px 38px rgba(0, 0, 0, 0.3), 0px 15px 12px rgba(0, 0, 0, 0.22)',
    },
    content: {
      'color': 'rgba(0, 0, 0, 0.541327)',
      'fontStyle': 'normal',
      'lineHeight': '24px',
      'padding': theme.spacing(3, 3, 1.5),

      '& h5, & h6': {
        '&:not(:first-child)': {
          marginTop: theme.spacing(2),
        },
      },
    },
    actions: {
      justifyContent: 'flex-end',
      padding: theme.spacing(1.5, 3, 3),
    },
    title: {
      color: 'rgba(0, 0, 0, 0.87)',
      fontWeight: 500,
      lineHeight: '23px',
    },
  }),
);

const ServicesError: FC<ServicesErrorProps> = ({ error, onClose }) => {
  const classes = useStyles({});
  const { t } = useTranslation();

  const name = error instanceof ApolloError ? error.message : error;

  return (
    <Card className={classes.root}>
      <CardContent className={classes.content}>
        <Typography variant="h5" className={classes.title}>
          {t('tickets:error.title')}
        </Typography>
        <Typography variant="subtitle1">{t('tickets:error.body1', { name })}</Typography>
        <Typography variant="subtitle1">{t('tickets:error.body2')}</Typography>
      </CardContent>
      <CardActions className={classes.actions}>
        <Button onClick={onClose} actionType="close">
          {t('common:close')}
        </Button>
      </CardActions>
    </Card>
  );
};

export default ServicesError;
