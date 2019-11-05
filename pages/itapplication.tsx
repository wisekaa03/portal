/** @format */

// #region Imports NPM
import React, { useState } from 'react';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { Paper, Tabs, Tab, Box } from '@material-ui/core';
import SwipeableViews from 'react-swipeable-views';
// #endregion
// #region Imports Local
import Page from '../layouts/main';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '../lib/i18n-client';
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
    tab: {
      flex: 1,
    },
  }),
);

const ITApplication: I18nPage = ({ t, ...rest }): React.ReactElement => {
  const classes = useStyles({});
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number): void => {
    setCurrentTab(newValue);
  };

  const handleChangeTabIndex = (index: number): void => {
    setCurrentTab(index);
  };

  return (
    <Page {...rest}>
      <div className={classes.root}>
        <Paper square className={classes.header}>
          <Tabs value={currentTab} indicatorColor="primary" textColor="primary" onChange={handleTabChange}>
            <Tab label={t('itapplication:tabs.tab1')} />
            <Tab label={t('itapplication:tabs.tab2')} />
          </Tabs>
        </Paper>
        <SwipeableViews
          index={currentTab}
          className={classes.contentWrap}
          containerStyle={{ flex: 1 }}
          slideClassName={classes.content}
          onChangeIndex={handleChangeTabIndex}
        >
          <Box className={classes.tab}>TAB 1</Box>
          <Box className={classes.tab}>TAB 2</Box>
        </SwipeableViews>
      </div>
    </Page>
  );
};

ITApplication.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['itapplication']),
});

export default nextI18next.withTranslation('itapplication')(ITApplication);
