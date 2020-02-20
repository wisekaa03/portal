/** @format */

// #region Imports NPM
import React, { FC, useRef } from 'react';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { Paper, Tabs, Tab, Box, FormControl, TextField } from '@material-ui/core';
import SwipeableViews from 'react-swipeable-views';
import clsx from 'clsx';
// #endregion
// #region Imports Local
import { ServicesWrapperProps } from './types';
// import ServicesTab from './tab';
import ServicesSuccess from './success';
import { appBarHeight } from '../app-bar';
import ServicesElement from './element';
import { useTranslation } from '../../lib/i18n-client';
import Loading from '../loading';
import JoditEditor from '../jodit';
import Dropzone from '../dropzone';
import Button from '../ui/button';
import RefreshButton from '../ui/refresh-button';
// #endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    header: {
      '& button': {
        padding: theme.spacing(2, 4),
      },
    },
    body: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
    },
    container: {
      display: 'grid',
      gap: `${theme.spacing()}px ${theme.spacing(4)}px`,
      padding: theme.spacing(2, 4),

      [theme.breakpoints.up('sm')]: {
        padding: theme.spacing(4, 8),
        gridTemplateColumns: '1fr 1fr',
      },

      [theme.breakpoints.up('md')]: {
        gridTemplateColumns: '1fr 1fr 1fr',
      },
    },
    formControl: {
      marginBottom: theme.spacing(3),
      width: '90%',
      [theme.breakpoints.up('md')]: {
        width: '80%',
      },
      [theme.breakpoints.up('lg')]: {
        width: '60%',
      },
    },
    formAction: {
      'display': 'flex',
      'flexDirection': 'row',
      'justifyContent': 'flex-end',
      '& button:not(:last-child)': {
        marginRight: theme.spacing(),
      },
    },
  }),
);

const ServicesComponent: FC<ServicesWrapperProps> = ({
  contentRef,
  titleRef,
  bodyRef,
  currentTab,
  ticket,
  created,
  departments,
  services,
  categories,
  body,
  setBody,
  files,
  setFiles,
  loadingServices,
  loadingCreated,
  refetchServices,
  handleCurrentTab,
  handleTitle,
  handleSubmit,
  handleResetTicket,
}) => {
  const classes = useStyles({});
  const { t } = useTranslation();
  const headerRef = useRef(null);

  const contentHeight = headerRef.current
    ? `calc(100vh - ${appBarHeight}px - ${headerRef.current.clientHeight}px)`
    : '100%';

  const invalidTitle = ticket.title.length < 10 && body.length > 0;

  return (
    <Box display="flex" flexDirection="column" position="relative">
      <Paper ref={headerRef} square className={classes.header}>
        <Tabs
          value={currentTab}
          indicatorColor="primary"
          textColor="primary"
          onChange={(_: any, tab: number): void => handleCurrentTab(tab)}
        >
          <Tab label={t('services:tabs.tab1')} />
          <Tab disabled={!ticket.department} label={t('services:tabs.tab2')} />
          <Tab disabled={!ticket.service} label={t('services:tabs.tab3')} />
          <Tab disabled={!ticket.category} label={t('services:tabs.tab4')} />
          <Tab disabled={!created} label={t('services:tabs.tab5')} />
        </Tabs>
      </Paper>
      <Loading activate={loadingServices} full type="circular" color="secondary" disableShrink size={48}>
        <>
          {currentTab < 4 && <RefreshButton onClick={() => refetchServices()} />}
          <SwipeableViews
            ref={contentRef}
            animateHeight
            disabled={!ticket.department}
            index={currentTab}
            className={classes.body}
            containerStyle={{ flexGrow: 1 }}
            onSwitching={handleCurrentTab}
          >
            <Box className={classes.container}>
              {departments.map((current) => (
                <ServicesElement key={current.code} withLink element={current} active={ticket.department?.code} />
              ))}
            </Box>
            <Box className={classes.container} style={{ minHeight: contentHeight }}>
              {services.map((current) => (
                <ServicesElement
                  key={current.code}
                  withLink
                  base64
                  element={current}
                  active={ticket.service?.code}
                  linkQuery={{ department: ticket.department?.code }}
                />
              ))}
            </Box>
            <Box className={classes.container} style={{ minHeight: contentHeight }}>
              {categories.map((current) => (
                <ServicesElement
                  key={current.code}
                  withLink
                  base64
                  element={current}
                  active={ticket.category?.code}
                  linkQuery={{
                    department: ticket.department?.code,
                    service: ticket.service?.code,
                  }}
                />
              ))}
            </Box>
            <Box
              style={{ minHeight: contentHeight }}
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
            >
              {ticket.department && ticket.service && ticket.category && (
                <Box display="grid" className={classes.formControl}>
                  <ServicesElement element={ticket.department} />
                  <ServicesElement base64 element={ticket.service} />
                  <ServicesElement base64 element={ticket.category} />
                </Box>
              )}
              <FormControl className={classes.formControl} variant="outlined">
                <TextField
                  inputRef={titleRef}
                  error={invalidTitle}
                  value={ticket.title}
                  onChange={handleTitle}
                  type="text"
                  label={t('services:form.title')}
                  variant="outlined"
                />
              </FormControl>
              <FormControl className={classes.formControl} variant="outlined">
                <JoditEditor ref={bodyRef} value={body} onChange={setBody} />
              </FormControl>
              <FormControl className={classes.formControl} variant="outlined">
                <Dropzone files={files} setFiles={setFiles} />
              </FormControl>
              <FormControl className={clsx(classes.formControl, classes.formAction)}>
                <Button actionType="cancel" onClick={handleResetTicket}>
                  {t('common:cancel')}
                </Button>
                <Button onClick={handleSubmit}>{t('common:accept')}</Button>
              </FormControl>
            </Box>
            <Box
              style={{ minHeight: contentHeight }}
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
            >
              <Loading
                activate={loadingCreated || !created}
                full
                type="circular"
                color="secondary"
                disableShrink
                size={48}
              >
                <ServicesSuccess data={created} />
              </Loading>
            </Box>
          </SwipeableViews>
        </>
      </Loading>
    </Box>
  );
};

export default ServicesComponent;
