/** @format */

// #region Imports NPM
import React, { useRef } from 'react';
import dynamic from 'next/dynamic';
import { withStyles } from '@material-ui/core/styles';
import { Box, Typography, Card, CardContent, CardActions } from '@material-ui/core';
import SendIcon from '@material-ui/icons/SendOutlined';
import ReactToPrint from 'react-to-print';
// #endregion
// #region Imports Local
import { ServicesSuccessProps, ServicesSuccessCardProps } from '@lib/types';
import Button from '@front/components/ui/button';
import { useTranslation } from '@lib/i18n-client';
import { format } from '@lib/dayjs';
// #endregion

const ReactToPdf = dynamic(() => import('react-to-pdf'), { ssr: false }) as any;

const ServicesSuccessCard = withStyles((theme) => ({
  root: {
    'padding': theme.spacing(2),
    'width': '100%',
    '& h5': {
      marginBottom: theme.spacing(),
    },
    '& h5, & h6': {
      textAlign: 'center',
    },
  },
}))(({ cardRef, classes, data }: ServicesSuccessCardProps) => {
  const { code, name, organization, category, requisiteSource, status, createdDate } = data;
  const { t, i18n } = useTranslation();

  return (
    <CardContent ref={cardRef} className={classes.root}>
      <Typography variant="h5">{t('services:success')}</Typography>
      <Typography variant="subtitle1">{t('services:complete.code', { value: code })}</Typography>
      <Typography variant="subtitle1">{t('services:complete.name', { value: name })}</Typography>
      <Typography variant="subtitle1">{t('services:complete.company', { value: organization })}</Typography>
      <Typography variant="subtitle1">{t('services:complete.service', { value: category })}</Typography>
      <Typography variant="subtitle1">{t('services:complete.category', { value: requisiteSource })}</Typography>
      <Typography variant="subtitle1">{t('services:complete.status', { value: status })}</Typography>
      <Typography variant="subtitle1">{t('services:complete.date', { value: format(createdDate, i18n) })}</Typography>
    </CardContent>
  );
});

const ServicesSuccess = withStyles({
  root: {
    width: '90vw',
    maxWidth: '600px',
  },
})(({ classes, data }: ServicesSuccessProps) => {
  const { t } = useTranslation();
  const cardRef = useRef(null);

  return (
    <Card className={classes.root}>
      <ServicesSuccessCard cardRef={cardRef} data={data} />
      <CardActions>
        <Box display="flex" flexGrow={1} justifyContent="space-around" p={2}>
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
        </Box>
      </CardActions>
    </Card>
  );
});

export default ServicesSuccess;
