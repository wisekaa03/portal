/** @format */

// #region Imports NPM
import React from 'react';
import Head from 'next/head';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { Button, Paper, Typography } from '@material-ui/core';
import { useMutation } from '@apollo/react-hooks';
// import { blue } from '@material-ui/core/colors';
// #endregion
// #region Imports Local
import Page from '../layouts/main';
import { ProfileContext } from '../lib/context';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '../lib/i18n-client';
import { USER_SETTINGS } from '../lib/queries';
// #endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(2),
      display: 'grid',
      gridTemplateColumns: '200px',
      height: 'fit-content',
      gridGap: theme.spacing(),
    },
    buttonLang: {
      // backgroundColor: blue[400],
    },
  }),
);

const Settings: I18nPage = (props): React.ReactElement => {
  const { t } = props;
  const classes = useStyles({});

  const [userSettings] = useMutation(USER_SETTINGS);

  const handleLanguage = (prevLng: 'ru' | 'en' | '' | null | undefined) => (): void => {
    const currentLng = prevLng || nextI18next.i18n.language;
    const lng = currentLng === 'ru' ? 'en' : 'ru';

    nextI18next.i18n.changeLanguage(lng);
    userSettings({
      variables: {
        value: { lng },
      },
    });
  };

  return (
    <>
      <Head>
        <title>{t('setting:title')}</title>
      </Head>
      <Page {...props}>
        <div className={classes.root}>
          <ProfileContext.Consumer>
            {(context) => (
              <>
                {context.user && (
                  <>
                    <Button
                      color="primary"
                      variant="contained"
                      className={classes.buttonLang}
                      onClick={handleLanguage(context.user.settings && context.user.settings.lng)}
                    >
                      {t('common:changeLanguage')}
                    </Button>
                  </>
                )}
              </>
            )}
          </ProfileContext.Consumer>
        </div>
      </Page>
    </>
  );
};

Settings.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['setting']),
});

export default nextI18next.withTranslation('setting')(Settings);
