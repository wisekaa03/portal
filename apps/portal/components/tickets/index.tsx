/** @format */

//#region Imports NPM
import clsx from 'clsx';
import React, { FC, useRef, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import SwipeableViews from 'react-swipeable-views';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { Paper, Tabs, Tab, Box, FormControl, Select, MenuItem, TextField, Typography, Grid } from '@material-ui/core';
import StarBorderIcon from '@material-ui/icons/StarBorderOutlined';
//#endregion
//#region Imports Local
import { useTranslation } from '@lib/i18n-client';
import { appBarHeight } from '@lib/constants';
import type { TicketsWrapperProps, ServicesFavoriteProps, UserSettingsTaskFavorite } from '@lib/types';
import Button from '@front/components/ui/button';
import RefreshButton from '@front/components/ui/refresh-button';
import Loading from '@front/components/loading';
import Dropzone from '@front/components/dropzone';
import { Icon } from '@front/components/ui/icon';
import ServicesSuccess from './success';
import ServicesElement from './element';
import ServicesElementFavorites from './element.favorites';
import ServicesError from './error';
//#endregion

const JoditEditor = dynamic(() => import('@front/components/jodit'), { ssr: false });

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
    blockContainer: {
      display: 'grid',
      gap: `${theme.spacing()}px ${theme.spacing(4)}px`,
      padding: theme.spacing(2, 4),

      [theme.breakpoints.down('xl')]: {
        padding: theme.spacing(4, 8),
        gridTemplateColumns: '1fr 1fr',
      },
      [theme.breakpoints.up('xl')]: {
        gridTemplateColumns: '1fr 1fr 1fr',
      },
    },
    formControl: {
      marginBottom: theme.spacing(3),
      width: '90%',
      [theme.breakpoints.down('xl')]: {
        width: '80%',
      },
      [theme.breakpoints.up('xl')]: {
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
    blockTitle: {
      'fontWeight': 500,
      'lineHeight': '21px',
      'background': '#F7FBFA',
      'boxShadow': '0px 4px 4px rgba(0, 0, 0, 0.25)',
      'borderRadius': theme.shape.borderRadius,
      'padding': theme.spacing(2, 4, 2, 9),

      '&:not(:first-child)': {
        marginTop: theme.spacing(2),
      },
    },
    blockTitleWithIcon: {
      padding: theme.spacing(2, 4),
      display: 'flex',
      alignItems: 'center',
    },
    titleIcon: {
      color: theme.palette.secondary.main,
      display: 'flex',
      marginRight: theme.spacing(2),
    },
    select: {
      '&:focus': {
        backgroundColor: 'transparent',
      },
    },
    jodit: {
      backgroundColor: '#F5FDFF',
    },
    margin: {
      margin: '0 0 0 18px',
    },
  }),
);

const TicketsComponent: FC<TicketsWrapperProps> = ({
  contentRef,
  serviceRef,
  subjectRef,
  bodyRef,
  currentTab,
  errorCreated,
  task,
  created,
  routes,
  favorites,
  subject,
  setSubject,
  body,
  setBody,
  files,
  setFiles,
  submitted,
  loadingSettings,
  loadingRoutes,
  loadingCreated,
  handleCurrentTab,
  handleService,
  handleSubmit,
  handleResetTicket,
  handleFavorites,
}) => {
  const classes = useStyles({});
  const { t } = useTranslation();
  const headerReference = useRef<HTMLDivElement>(null);

  const contentHeight = headerReference.current ? `calc(100vh - ${appBarHeight}px - ${headerReference.current.clientHeight}px)` : '100%';

  const handleChangeTab = useCallback(async (_, tab): Promise<void> => handleCurrentTab(tab), [handleCurrentTab]);
  const updateFavorites = useCallback(
    async ({ favorite: { where, code, svcCode }, action }: ServicesFavoriteProps) => {
      let result: UserSettingsTaskFavorite[] = [];

      switch (action) {
        case 'delete':
          result = favorites.reduce((accumulator, current) => {
            if (current.route.where === where && current.route.code === code && current.service.code === svcCode) {
              return accumulator;
            }
            return [
              ...accumulator,
              {
                where: current.route.where,
                code: current.route.code,
                svcCode: current.service.code,
              },
            ];
          }, [] as UserSettingsTaskFavorite[]);

          break;

        case 'up':
        case 'down': {
          const currentIndex = favorites.findIndex(
            (element) => element.route.where === where && element.route.code === code && element.service.code === svcCode,
          );
          const newIndex = action === 'up' ? currentIndex - 1 : currentIndex + 1;

          const fav = [...favorites];
          fav.splice(newIndex, 0, ...fav.splice(currentIndex, 1));
          result = fav.reduce(
            (accumulator, element) => [
              ...accumulator,
              {
                where: element.route.where,
                code: element.route.code,
                svcCode: element.service.code,
              },
            ],
            [] as UserSettingsTaskFavorite[],
          );

          break;
        }

        case 'add':
        default:
          result = [
            ...favorites.reduce((accumulator, favorite) => {
              if (favorite.route.where && favorite.route.code && favorite.service.code) {
                return [
                  ...accumulator,
                  {
                    where: favorite.route.where,
                    code: favorite.route.code,
                    svcCode: favorite.service.code,
                  },
                ];
              }

              return accumulator;
            }, [] as UserSettingsTaskFavorite[]),
            {
              where,
              code,
              svcCode,
            },
          ];
      }

      handleFavorites(result);
    },
    [favorites, handleFavorites],
  );
  const handleAddFavorite = useCallback(
    async () =>
      task.route &&
      task.service &&
      updateFavorites({
        favorite: {
          where: task.route?.where,
          code: task.route?.code,
          svcCode: task.service?.code,
        },
        action: 'add',
      }),
    [updateFavorites, task.route, task.service],
  );

  const isFavorite = useMemo<boolean>(
    () =>
      (task.route &&
        task.service &&
        Array.isArray(favorites) &&
        !!favorites.find(
          ({ route, service }) =>
            route?.code === task.route?.code && route?.where === task.route?.where && service?.code === task.service?.code,
        )) ??
      true,
    [task.route, task.service, favorites],
  );

  const enableBody = useMemo<boolean>(() => Boolean(task.route?.code && task.service?.code), [task.route, task.service]);
  // const notValid = !enableBody; // || body.trim().length < MINIMAL_BODY_LENGTH;
  const service = useMemo<string>(() => task.service?.code || '', [task.service]);

  return (
    <Box style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <Paper ref={headerReference} square className={classes.header}>
        <Tabs value={currentTab} indicatorColor="secondary" textColor="secondary" onChange={handleChangeTab}>
          <Tab label={t('tickets:tabs.tab1')} />
          <Tab disabled={!task.route} label={t('tickets:tabs.tab2')} />
        </Tabs>
      </Paper>
      <Loading activate={loadingRoutes} full type="circular" color="secondary" disableShrink size={48}>
        <SwipeableViews
          ref={contentRef}
          // animateHeight={!!task.route}
          disabled={!task.route}
          index={currentTab}
          className={classes.body}
          containerStyle={{ flexGrow: 1 }}
          onSwitching={handleCurrentTab}
        >
          <Box style={{ minHeight: contentHeight }}>
            {Array.isArray(favorites) && favorites.length > 0 && (
              <>
                <Box className={clsx(classes.blockTitle, classes.blockTitleWithIcon)}>
                  <Box className={classes.titleIcon}>
                    <StarBorderIcon />
                  </Box>
                  {t('tickets:headers.favorites')}
                </Box>
                <Box className={classes.blockContainer}>
                  {favorites.map((current, index) => (
                    <ServicesElementFavorites
                      key={`fav-${current.service?.where}-${current.service?.code}`}
                      favorite={current}
                      base64
                      withLink
                      loadingSettings={loadingSettings}
                      setFavorite={updateFavorites}
                      isUp={index > 0}
                      isDown={index < favorites.length - 1}
                    />
                  ))}
                </Box>
              </>
            )}
            <Box className={classes.blockTitle}>{t('tickets:headers.list')}</Box>
            <Box className={classes.blockContainer}>
              {Array.isArray(routes) &&
                routes.length > 0 &&
                routes.map(
                  (current) => current && <ServicesElement key={`${current.where}-${current.code}`} base64 withLink route={current} />,
                )}
            </Box>
          </Box>
          <Box
            style={{ minHeight: contentHeight, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
          >
            {submitted ? (
              <Loading activate={loadingCreated} full type="circular" color="secondary" disableShrink size={48}>
                {errorCreated ? (
                  <ServicesError error={errorCreated} onClose={handleResetTicket} />
                ) : (
                  <ServicesSuccess data={created} onClose={handleResetTicket} />
                )}
              </Loading>
            ) : (
              <>
                {task.route && (
                  <Grid container spacing={8} style={{ gridTemplateColumns: '1fr 300px' }} className={classes.formControl}>
                    <ServicesElement key={`t-${task.route}`} base64 route={task.route} active />
                    <Box style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                      {!isFavorite && (
                        <Button actionType="favorite" onClick={handleAddFavorite}>
                          {t('common:favorite')}
                        </Button>
                      )}
                    </Box>
                  </Grid>
                )}
                <FormControl className={classes.formControl} variant="outlined">
                  <Select
                    value={service}
                    inputRef={serviceRef}
                    onChange={(event) => handleService(event as React.ChangeEvent<HTMLSelectElement>)}
                    classes={{
                      select: classes.select,
                    }}
                  >
                    {/* <MenuItem value="0">{t('tickets:form.service')}</MenuItem>*/}
                    {task.route &&
                      task.route.services?.map(
                        (srv) =>
                          srv && (
                            <MenuItem key={srv.code} value={srv.code}>
                              <Icon base64 src={srv.avatar} size={21} />
                              <Typography className={classes.margin} component="span">
                                {srv.name}
                              </Typography>
                            </MenuItem>
                          ),
                      )}
                  </Select>
                </FormControl>
                <FormControl className={classes.formControl} variant="outlined">
                  <TextField
                    ref={subjectRef}
                    disabled={!enableBody}
                    value={subject}
                    onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
                      setSubject(event.target.value);
                    }}
                    variant="outlined"
                    label={t('tickets:form.subject')}
                  />
                </FormControl>
                <FormControl className={clsx(classes.formControl, classes.jodit)} variant="outlined">
                  <JoditEditor ref={bodyRef} id="tickets" value={body} onBlur={setBody} disabled={!enableBody} />
                </FormControl>
                <FormControl className={classes.formControl} variant="outlined">
                  <Dropzone files={files} setFiles={setFiles} />
                </FormControl>
                <FormControl className={clsx(classes.formControl, classes.formAction)}>
                  <Button actionType="cancel" onClick={handleResetTicket}>
                    {t('common:cancel')}
                  </Button>
                  <Button onClick={handleSubmit} disabled={!enableBody}>
                    {t('common:send')}
                  </Button>
                </FormControl>
              </>
            )}
          </Box>
        </SwipeableViews>
      </Loading>
    </Box>
  );
};

export default TicketsComponent;
