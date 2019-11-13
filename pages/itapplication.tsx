/** @format */

// #region Imports NPM
import React, { useState } from 'react';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { Paper, Tabs, Tab, Box, Container, FormControl, TextField, Button, Typography } from '@material-ui/core';
import SwipeableViews from 'react-swipeable-views';
import AutoSizer from 'react-virtualized-auto-sizer';
import clsx from 'clsx';
// #endregion
// #region Imports Local
import Page from '../layouts/main';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '../lib/i18n-client';
import BaseIcon from '../components/icon';
import AppIcon1 from '../public/images/svg/itapps/app_1.svg';
import AppIcon2 from '../public/images/svg/itapps/app_2.svg';
import AppIcon3 from '../public/images/svg/itapps/app_3.svg';
import AppIcon4 from '../public/images/svg/itapps/app_4.svg';
import AppIcon5 from '../public/images/svg/itapps/app_5.svg';
import AppIcon6 from '../public/images/svg/itapps/app_6.svg';
import AppIcon7 from '../public/images/svg/itapps/app_7.svg';
import AppIcon8 from '../public/images/svg/itapps/app_8.svg';
import AppIcon9 from '../public/images/svg/itapps/app_9.svg';
import AppIcon10 from '../public/images/svg/itapps/app_10.svg';
import AppIcon11 from '../public/images/svg/itapps/app_11.svg';
import AppIcon12 from '../public/images/svg/itapps/app_12.svg';
import AppIcon13 from '../public/images/svg/itapps/app_13.svg';
import AppIcon14 from '../public/images/svg/itapps/app_14.svg';
import AppIcon15 from '../public/images/svg/itapps/app_15.svg';
import AppIcon16 from '../public/images/svg/itapps/app_16.svg';
import AppIcon17 from '../public/images/svg/itapps/app_17.svg';
import AppIcon18 from '../public/images/svg/itapps/app_18.svg';
import AppIcon19 from '../public/images/svg/itapps/app_19.svg';
import AppIcon20 from '../public/images/svg/itapps/app_20.svg';
import AppIcon21 from '../public/images/svg/itapps/app_21.svg';
// #endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
    },
    header: {
      '& button': {
        padding: `${theme.spacing(2)}px ${theme.spacing(8)}px`,
      },
    },
    contentWrap: {
      display: 'flex',
      flex: 1,
    },
    content: {
      display: 'flex',
    },
    container1: {
      display: 'grid',
      gridGap: `${theme.spacing()}px ${theme.spacing(4)}px`,
      padding: `${theme.spacing(2)}px ${theme.spacing(4)}px`,

      [theme.breakpoints.up('sm')]: {
        padding: `${theme.spacing(4)}px ${theme.spacing(8)}px`,
        gridTemplateColumns: '1fr 1fr',
      },

      [theme.breakpoints.up('md')]: {
        gridTemplateColumns: '1fr 1fr 1fr',
      },
    },
    container2: {
      'display': 'flex',
      'flexDirection': 'column',
      'justifyContent': 'center',
      'alignItems': 'center',

      '& > div:not(:last-child)': {
        marginBottom: theme.spacing(3),
      },
    },
    service: {
      'padding': theme.spacing(),
      'borderRadius': theme.spacing() / 2,
      'display': 'grid',
      'gridTemplateColumns': '60px 1fr',
      'gridGap': theme.spacing(),
      'justifyItems': 'flex-start',
      'alignItems': 'center',
      '&:not($formControl)': {
        cursor: 'pointer',
      },
      'color': '#484848',
      '&:hover:not($currentService):not($formControl) h6': {
        color: '#000',
      },
      [theme.breakpoints.down('xs')]: {
        '&:last-child': {
          marginBottom: theme.spacing(),
        },
      },
    },
    currentService: {
      '& h6': {
        color: '#000',
      },
    },
    // subtitle: {
    //   color: '#757575',
    //   padding: `${theme.spacing()}px 0`,
    //   borderBottom: '1px solid #C4C4C4',
    // },
    formControl: {
      [theme.breakpoints.up('sm')]: {
        minWidth: '50vw',
      },

      [theme.breakpoints.down('sm')]: {
        minWidth: '90vw',
      },
    },
    formAction: {
      'display': 'flex',
      'flexDirection': 'row',
      'justifyContent': 'flex-end',

      '& button': {
        borderRadius: theme.spacing(3),
      },
    },
    textField: {},
    buttonAccept: {
      backgroundColor: '#DEECEC',
    },
    buttonCancel: {
      backgroundColor: '#ECDEDE',
      marginRight: theme.spacing(),
    },
  }),
);

interface ServicesProps {
  id: number;
  icon: any;
  title: string;
  subtitle: string;
}

const services: ServicesProps[] = [
  { id: 0, icon: AppIcon1, title: '1C:Бухгалтерия', subtitle: 'текст' },
  { id: 1, icon: AppIcon2, title: 'Рабочее место', subtitle: 'текст' },
  { id: 2, icon: AppIcon3, title: 'Печать и сканирование', subtitle: 'текст' },
  { id: 3, icon: AppIcon4, title: 'Телефония', subtitle: 'текст' },
  { id: 4, icon: AppIcon5, title: 'Расходные материалы', subtitle: 'текст' },
  { id: 5, icon: AppIcon6, title: 'Электронная почта', subtitle: 'текст' },
  { id: 6, icon: AppIcon7, title: 'Справочные системы', subtitle: 'текст' },
  { id: 7, icon: AppIcon8, title: 'Банк-Клиенты', subtitle: 'текст' },
  { id: 8, icon: AppIcon9, title: '1C:Документооборот', subtitle: 'текст' },
  { id: 9, icon: AppIcon10, title: '1C:Зарплата', subtitle: 'текст' },
  { id: 10, icon: AppIcon11, title: 'Доступ к информационным ресурсам', subtitle: 'текст' },
  { id: 11, icon: AppIcon12, title: 'Новое рабочее место', subtitle: 'текст' },
  { id: 12, icon: AppIcon13, title: '1C:КСУП', subtitle: 'текст' },
  { id: 13, icon: AppIcon14, title: 'Веб-сайты', subtitle: 'текст' },
  { id: 14, icon: AppIcon15, title: 'Фотография', subtitle: 'текст' },
  { id: 15, icon: AppIcon16, title: 'Дизайн и полиграфия', subtitle: 'текст' },
  { id: 16, icon: AppIcon17, title: '1C:Автотранспорт', subtitle: 'текст' },
  { id: 17, icon: AppIcon18, title: 'Брендирование', subtitle: 'текст' },
  { id: 18, icon: AppIcon19, title: 'Создание макета', subtitle: 'текст' },
  { id: 19, icon: AppIcon20, title: '1C:Консолидация', subtitle: 'текст' },
  { id: 20, icon: AppIcon21, title: 'Заказать услугу', subtitle: 'текст' },
];

const ITApplication: I18nPage = ({ t, ...rest }): React.ReactElement => {
  const classes = useStyles({});
  const [currentTab, setCurrentTab] = useState(0);
  const [currentService, setCurrentService] = useState<number>(-1);
  const [title, setTitle] = useState<string>('');
  const [text, setText] = useState<string>('');

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number): void => {
    setCurrentTab(newValue);
  };

  const handleChangeTabIndex = (index: number): void => {
    setCurrentTab(index);
  };

  const handleCurrentService = (index: number) => (): void => {
    setCurrentService(index);
    setCurrentTab(1);
  };

  const handleTitle = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setTitle(event.target.value);
  };

  const handleText = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setText(event.target.value);
  };

  const handleAccept = (): void => {};

  const handleClose = (): void => {
    setCurrentService(-1);
    setCurrentTab(0);
    setTitle('');
    setText('');
  };

  return (
    <Page {...rest}>
      <div className={classes.root}>
        <Paper square className={classes.header}>
          <Tabs value={currentTab} indicatorColor="primary" textColor="primary" onChange={handleTabChange}>
            <Tab label={t('itapplication:tabs.tab1')} />
            <Tab disabled={currentService < 0} label={t('itapplication:tabs.tab2')} />
          </Tabs>
        </Paper>
        <SwipeableViews
          disabled={currentService < 0}
          index={currentTab}
          className={classes.contentWrap}
          containerStyle={{ flexGrow: 1 }}
          slideClassName={classes.content}
          onChangeIndex={handleChangeTabIndex}
        >
          <Box display="flex" flexGrow={1}>
            <AutoSizer style={{ flexGrow: 1 }}>
              {({ height, width }) => (
                <Container className={classes.container1} style={{ height, width }}>
                  {services.map((service) => (
                    <Box
                      key={service.id}
                      onClick={handleCurrentService(service.id)}
                      className={clsx(classes.service, {
                        [classes.currentService]: currentService === service.id,
                      })}
                    >
                      <div>
                        <BaseIcon src={service.icon} size={48} />
                      </div>
                      <div>
                        <Typography variant="subtitle1">{service.title}</Typography>
                      </div>
                    </Box>
                  ))}
                </Container>
              )}
            </AutoSizer>
          </Box>
          <Box display="flex" flexGrow={1}>
            <Container className={classes.container2}>
              {currentService >= 0 && (
                <Box className={clsx(classes.service, classes.formControl)}>
                  <div>
                    <BaseIcon src={services[currentService].icon} size={48} />
                  </div>
                  <div>
                    <Typography variant="subtitle1">{services[currentService].title}</Typography>
                  </div>
                </Box>
              )}
              <FormControl className={classes.formControl} variant="outlined">
                <TextField
                  data-field-name="title"
                  value={title}
                  onChange={handleTitle}
                  type="text"
                  label={t('itapplication:form.title')}
                  variant="outlined"
                  className={classes.textField}
                />
              </FormControl>
              <FormControl className={classes.formControl} variant="outlined">
                <TextField
                  data-field-name="text"
                  value={text}
                  onChange={handleText}
                  multiline
                  rows={10}
                  type="text"
                  label={t('itapplication:form.text')}
                  variant="outlined"
                  className={classes.textField}
                />
              </FormControl>
              <FormControl className={clsx(classes.formControl, classes.formAction)}>
                <Button variant="contained" className={classes.buttonCancel} onClick={handleClose}>
                  {t('common:cancel')}
                </Button>
                <Button variant="contained" className={classes.buttonAccept} onClick={handleAccept}>
                  {t('common:accept')}
                </Button>
              </FormControl>
            </Container>
          </Box>
        </SwipeableViews>
      </div>
    </Page>
  );
};

ITApplication.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['itapplication']),
});

export default nextI18next.withTranslation('itapplication')(ITApplication);
