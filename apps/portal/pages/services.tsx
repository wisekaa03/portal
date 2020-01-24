/** @format */

// #region Imports NPM
import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import {
  Paper,
  Tabs,
  Tab,
  Box,
  FormControl,
  TextField,
  Typography,
  Select,
  MenuItem,
  InputLabel,
} from '@material-ui/core';
import SwipeableViews from 'react-swipeable-views';
import { useQuery } from '@apollo/react-hooks';
import clsx from 'clsx';
// #endregion
// #region Imports Local
import Dropzone from '../components/dropzone';
import { DropzoneFile } from '../components/dropzone/types';
import { appBarHeight } from '../components/app-bar';
import Page from '../layouts/main';
import { SERVICES } from '../lib/queries';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '../lib/i18n-client';
import BaseIcon from '../components/icon';
import Button from '../components/button';
import ServicesIcon from '../../../public/images/svg/icons/services.svg';
// #endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
    },
    header: {
      '& button': {
        padding: `${theme.spacing(2)}px ${theme.spacing(4)}px`,
      },
    },
    contentWrap: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
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
      '& > div': {
        marginBottom: theme.spacing(3),
      },
    },
    serviceBox: {
      display: 'grid',
      gap: `0 ${theme.spacing(4)}px`,
      [theme.breakpoints.up('md')]: {
        gridTemplateColumns: '1fr 2fr',
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
      '&:hover:not($serviceIndex):not($serviceBox) h6': {
        color: '#000',
      },
    },
    serviceIndex: {
      '& h6': {
        color: '#000',
      },
    },
    formControl: {
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

const departments = [
  {
    id: 0,
    icon: ServicesIcon,
    title: 'Департамент ИТ',
  },
];

const Services: I18nPage = ({ t, ...rest }): React.ReactElement => {
  const classes = useStyles({});
  const [currentTab, setCurrentTab] = useState(0);
  const [departmentIndex, setDepartmentIndex] = useState<number>(-1);
  const [serviceIndex, setServiceIndex] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [files, setFiles] = useState<DropzoneFile[]>([]);

  const { loading, data, error } = useQuery(SERVICES);

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number): void => {
    setCurrentTab(newValue);
  };

  const handleChangeTabIndex = (index: number): void => {
    setCurrentTab(index);
  };

  const handleCurrentDepartment = (index: number) => (): void => {
    setDepartmentIndex(index);
    setCurrentTab(1);
  };

  const handleCurrentService = (index: string) => (): void => {
    setServiceIndex(index);
    setCurrentTab(2);
  };

  const handleTitle = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setTitle(event.target.value);
  };

  const handleText = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setText(event.target.value);
  };

  const handleCategory = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setCategory(event.target.value);
  };

  const handleAccept = (): void => {};

  const handleClose = (): void => {
    setDepartmentIndex(-1);
    setServiceIndex('');
    setCurrentTab(0);
    setTitle('');
    setText('');
    setFiles([]);
    setCategory('');
  };

  const inputLabel = useRef<HTMLLabelElement>(null);
  const [labelWidth, setLabelWidth] = useState(0);

  const currentDepartment = departmentIndex >= 0 ? departments[departmentIndex] : false;
  const currentService =
    data && data.OldTicketService ? data.OldTicketService.find((service) => service.code === serviceIndex) : false;

  useEffect(() => {
    if (inputLabel.current) {
      setLabelWidth(inputLabel.current!.offsetWidth);
    }
  }, [inputLabel, currentService]);

  const swipeableViews = useRef(null);

  useEffect(() => {
    if (swipeableViews && swipeableViews.current) {
      swipeableViews.current.updateHeight();
    }
  }, [swipeableViews, files]);

  const tabHeader = useRef(null);
  const containerHeight =
    tabHeader && tabHeader.current ? `calc(100vh - ${appBarHeight}px - ${tabHeader.current.clientHeight}px)` : '100%';

  return (
    <>
      <Head>
        <title>{t('services:title')}</title>
      </Head>
      <Page {...rest}>
        <div className={classes.root}>
          <Paper ref={tabHeader} square className={classes.header}>
            <Tabs value={currentTab} indicatorColor="primary" textColor="primary" onChange={handleTabChange}>
              <Tab label={t('services:tabs.tab1')} />
              <Tab disabled={!currentDepartment} label={t('services:tabs.tab2')} />
              <Tab disabled={!currentService} label={t('services:tabs.tab3')} />
            </Tabs>
          </Paper>
          <SwipeableViews
            ref={swipeableViews}
            animateHeight
            disabled={!currentDepartment}
            index={currentTab}
            className={classes.contentWrap}
            containerStyle={{ flexGrow: 1 }}
            onChangeIndex={handleChangeTabIndex}
          >
            <div className={classes.container1}>
              {departments.map((department) => (
                <Box
                  key={department.id}
                  onClick={handleCurrentDepartment(department.id)}
                  className={clsx(classes.service, {
                    [classes.serviceIndex]: departmentIndex === department.id,
                  })}
                >
                  <div>
                    <BaseIcon src={department.icon} size={48} />
                  </div>
                  <div>
                    <Typography variant="subtitle1">{department.title}</Typography>
                  </div>
                </Box>
              ))}
            </div>
            <div style={{ minHeight: containerHeight }} className={classes.container1}>
              {currentDepartment &&
                data &&
                data.OldTicketService &&
                data.OldTicketService.map((service) => (
                  <Box
                    key={service.code}
                    onClick={handleCurrentService(service.code)}
                    className={clsx(classes.service, {
                      [classes.serviceIndex]: serviceIndex === service.code,
                    })}
                  >
                    <div>
                      <BaseIcon base64={service.avatar} size={48} />
                    </div>
                    <div>
                      <Typography variant="subtitle1">{service.name}</Typography>
                    </div>
                  </Box>
                ))}
            </div>
            <div style={{ minHeight: containerHeight }} className={classes.container2}>
              {currentDepartment && currentService && (
                <div className={clsx(classes.serviceBox, classes.formControl)}>
                  <Box className={classes.service}>
                    <div>
                      <BaseIcon src={currentDepartment.icon} size={48} />
                    </div>
                    <div>
                      <Typography variant="subtitle1">{currentDepartment.title}</Typography>
                    </div>
                  </Box>
                  <Box className={classes.service}>
                    <div>
                      <BaseIcon base64={currentService.avatar} size={48} />
                    </div>
                    <div>
                      <Typography variant="subtitle1">{currentService.name}</Typography>
                    </div>
                  </Box>
                </div>
              )}
              {currentService && (
                <FormControl className={classes.formControl} variant="outlined">
                  <InputLabel ref={inputLabel}>{t('services:form.category')}</InputLabel>
                  <Select value={category} onChange={handleCategory} labelWidth={labelWidth}>
                    {currentService.category.map((cur) => (
                      <MenuItem key={cur.code} value={cur.code}>
                        {cur.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              <FormControl className={classes.formControl} variant="outlined">
                <TextField
                  value={title}
                  onChange={handleTitle}
                  type="text"
                  label={t('services:form.title')}
                  variant="outlined"
                />
              </FormControl>
              <FormControl className={classes.formControl} variant="outlined">
                <TextField
                  value={text}
                  onChange={handleText}
                  multiline
                  rows={10}
                  type="text"
                  label={t('services:form.text')}
                  variant="outlined"
                />
              </FormControl>
              <FormControl className={classes.formControl} variant="outlined">
                <Dropzone setFiles={setFiles} files={files} {...rest} />
              </FormControl>
              <FormControl className={clsx(classes.formControl, classes.formAction)}>
                <Button actionType="cancel" onClick={handleClose}>
                  {t('common:cancel')}
                </Button>
                <Button onClick={handleAccept}>{t('common:accept')}</Button>
              </FormControl>
            </div>
          </SwipeableViews>
        </div>
      </Page>
    </>
  );
};

Services.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['services']),
});

export default nextI18next.withTranslation('services')(Services);
