/** @format */

//#region Imports NPM
import React, { useRef } from 'react';
import dynamic from 'next/dynamic';
import { withStyles } from '@material-ui/core/styles';
import { Box, Typography, Card, CardContent, CardActions } from '@material-ui/core';
import SendIcon from '@material-ui/icons/SendOutlined';
import ReactToPrint from 'react-to-print';
//#endregion
//#region Imports Local
import { ServicesSuccessProps, ServicesSuccessCardProps } from '@lib/types';
import Button from '@front/components/ui/button';
import { useTranslation } from '@lib/i18n-client';
import { format } from '@lib/dayjs';
//#endregion

const ReactToPdf = dynamic(() => import('react-to-pdf'), { ssr: false }) as any;

const ServicesSuccessCard = withStyles((theme) => ({
  root: {
    'padding': theme.spacing(3, 3, 2),
    'width': '100%',

    '& h6': {
      fontStyle: 'normal',
      fontWeight: 'normal',
      fontSize: '16px',
      lineHeight: '24px',
      color: 'rgba(0, 0, 0, 0.541327)',
    },
  },
  title: {
    fontStyle: 'normal',
    fontWeight: 500,
    fontSize: '20px',
    lineHeight: '23px',
    marginBottom: theme.spacing(4),
  },
}))(({ cardRef, classes, data }: ServicesSuccessCardProps) => {
  const { code, route, createdDate, service, organization, status, subject } = data;
  const { t, i18n } = useTranslation();

  return (
    <CardContent ref={cardRef} className={classes.root}>
      <Typography variant="h5" className={classes.title}>
        {t('services:success')}
      </Typography>
      <Typography variant="subtitle1">{t('services:complete.name', { value: subject })}</Typography>
      <Typography variant="subtitle1">{t('services:complete.code', { value: code })}</Typography>
      <Typography variant="subtitle1">{t('services:complete.route', { value: route })}</Typography>
      <Typography variant="subtitle1">{t('services:complete.service', { value: service })}</Typography>
      <Typography variant="subtitle1">{t('services:complete.organization', { value: organization })}</Typography>
      <Typography variant="subtitle1">{t('services:complete.status', { value: status })}</Typography>
      <Typography variant="subtitle1">{t('services:complete.date', { value: format(createdDate, i18n) })}</Typography>
    </CardContent>
  );
});

const ServicesSuccess = withStyles((theme) => ({
  root: {
    width: '90vw',
    maxWidth: '600px',
    borderRadius: 2,
    boxShadow: '0px 19px 38px rgba(0, 0, 0, 0.3), 0px 15px 12px rgba(0, 0, 0, 0.22)',
  },
  actions: {
    display: 'flex',
    flex: 1,
    justifyContent: 'space-between',
    padding: theme.spacing(3),
  },
}))(({ classes, data, onClose }: ServicesSuccessProps) => {
  const { t } = useTranslation();
  const cardRef = useRef(null);

  return (
    <Card className={classes.root}>
      <ServicesSuccessCard cardRef={cardRef} data={data} />
      <CardActions className={classes.actions}>
        {/*
          <ComposeButton variant="contained" startIcon={<SendIcon />} rounded body={`<p>Код заявки: ${data.code}</p>`}>
            {t('common:send')}
          </ComposeButton> */}
        <ReactToPdf targetRef={cardRef} filename={`ticket_${data.code}.pdf`}>
          {({ toPdf }) => (
            <Button onClick={toPdf} actionType="save">
              {t('common:save')}
            </Button>
          )}
        </ReactToPdf>
        <ReactToPrint
          trigger={() => <Button actionType="print">{t('common:print')}</Button>}
          content={() => cardRef.current}
          copyStyles
        />
        <Button onClick={onClose} actionType="close">
          {t('common:close')}
        </Button>
      </CardActions>
    </Card>
  );
});

export default ServicesSuccess;
