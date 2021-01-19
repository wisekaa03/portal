/** @format */
/* eslint no-use-before-define:0, max-classes-per-file:0, no-return-assign:0 */

//#region Imports NPM
import React, { useRef } from 'react';
import dynamic from 'next/dynamic';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { Typography, Card, CardContent, CardActions } from '@material-ui/core';
import ReactToPrint from 'react-to-print';
//#endregion
//#region Imports Local
import dateFormat from '@lib/date-format';
import { ServicesSuccessProps, ServicesSuccessCardProps } from '@lib/types';
import Button from '@front/components/ui/button';
import { useTranslation } from '../../lib/i18n-client';
//#endregion

const ReactToPdf = dynamic(() => import('@front/components/react-to-pdf'), { ssr: false });

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
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
    card: {
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
  }),
);

const TicketsSuccessCard = React.forwardRef<HTMLDivElement, ServicesSuccessCardProps>(({ data }, ref) => {
  const { code, route, createdDate, service, organization, status, subject } = data;
  const classes = useStyles({});
  const { t, i18n } = useTranslation();

  return (
    <CardContent ref={ref} className={classes.card}>
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

const TicketsSuccess: React.FC<ServicesSuccessProps> = ({ data, onClose }) => {
  const classes = useStyles({});
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  return (
    <Card className={classes?.root}>
      <TicketsSuccessCard ref={ref} data={data} />
      <CardActions className={classes?.actions}>
        {/*
          <ComposeButton variant="contained" startIcon={<SendIcon />} rounded body={`<p>Код заявки: ${data.code}</p>`}>
            {t('common:send')}
          </ComposeButton> */}
        <ReactToPdf
          trigger={() => <Button actionType="save">{t('common:save')}</Button>}
          content={() => ref.current}
          filename={`Ticket: ${data.code}.pdf`}
        />
        <ReactToPrint trigger={() => <Button actionType="print">{t('common:print')}</Button>} content={() => ref.current} />
        <Button onClick={onClose} actionType="close">
          {t('common:close')}
        </Button>
      </CardActions>
    </Card>
  );
};

export default TicketsSuccess;
