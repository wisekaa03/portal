/** @format */
/* eslint no-use-before-define:0 */

//#region Imports NPM
import React, { useRef } from 'react';
import dynamic from 'next/dynamic';
import { withStyles } from '@material-ui/core/styles';
import { Typography, Card, CardContent, CardActions } from '@material-ui/core';
import ReactToPrint from 'react-to-print';
//#endregion
//#region Imports Local
import dateFormat from '@lib/date-format';
import { ServicesSuccessProps, ServicesSuccessCardProps } from '@lib/types';
import Button from '@front/components/ui/button';
import { useTranslation } from '@lib/i18n-client';
//#endregion

// const ReactToPdf = dynamic(() => import('react-to-pdf'), { ssr: false });
const ReactToPdf = dynamic(() => import('@front/components/react-to-pdf'), { ssr: false });

const ServicesSuccessCard = withStyles((theme) => ({
  root: {
    'padding': theme.spacing(3, 3, 2),
    'width': '100%',

    '& h6': {
      fontStyle: 'normal',
      fontWeight: 'normal',
      lineHeight: '24px',
      color: 'rgba(0, 0, 0, 0.541327)',
    },
  },
  title: {
    fontStyle: 'normal',
    fontWeight: 500,
    lineHeight: '23px',
    marginBottom: theme.spacing(4),
  },
}))(({ cardRef, classes, data }: ServicesSuccessCardProps) => {
  const { code, route, createdDate, service, organization, status, subject } = data;
  const { t, i18n } = useTranslation();

  return (
    <CardContent ref={cardRef} className={classes.root}>
      <Typography variant="h5" className={classes.title}>
        {t('tickets:success')}
      </Typography>
      <Typography variant="subtitle1">{t('tickets:complete.name', { value: subject })}</Typography>
      <Typography variant="subtitle1">{t('tickets:complete.code', { value: code })}</Typography>
      <Typography variant="subtitle1">{t('tickets:complete.route', { value: route })}</Typography>
      <Typography variant="subtitle1">{t('tickets:complete.service', { value: service })}</Typography>
      <Typography variant="subtitle1">{t('tickets:complete.organization', { value: organization })}</Typography>
      <Typography variant="subtitle1">{t('tickets:complete.status', { value: status })}</Typography>
      <Typography variant="subtitle1">{t('tickets:complete.date', { value: dateFormat(createdDate, i18n) })}</Typography>
    </CardContent>
  );
});

const ServicesSuccess = withStyles((theme) => ({
  root: {
    width: '90vw',
    maxWidth: '600px',
    borderRadius: theme.shape.borderRadius,
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
        <ReactToPdf ref={cardRef} filename={`ticket_${data.code}.pdf`}>
          {({ toPdf }: { toPdf: () => void }) => (
            <Button onClick={toPdf} actionType="save">
              {t('common:save')}
            </Button>
          )}
        </ReactToPdf>
        <ReactToPrint trigger={() => <Button actionType="print">{t('common:print')}</Button>} content={() => cardRef.current} copyStyles />
        <Button onClick={onClose} actionType="close">
          {t('common:close')}
        </Button>
      </CardActions>
    </Card>
  );
});

export default ServicesSuccess;
