/** @format */
/* eslint import/no-default-export: 0 */

//#region Imports NPM
import React, { useEffect } from 'react';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { Card, CardContent, Button, CardActions, Typography } from '@material-ui/core';
import { useMutation } from '@apollo/react-hooks';
import Head from 'next/head';
//#endregion
//#region Imports Local
import { MaterialUI } from '@front/layout';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '@lib/i18n-client';
import { SYNC, CACHE, USER_SETTINGS, defaultUserSettings } from '@lib/queries';
import { UserSettings } from '@lib/types/user.dto';
import snackbarUtils from '@lib/snackbar-utils';
//#endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(2),
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 310px)',
      gridTemplateRows: 'repeat(1, 150px)',
      // justifyContent: 'center',
      // alignContent: 'center',
      height: '100%',
      gap: `${theme.spacing()}px`,
    },
    card: {
      maxWidth: 345,
    },
    buttonSync: {
      // backgroundColor: green[300],
    },
    buttonCache: {
      // backgroundColor: green[300],
    },
    buttonSoap: {
      // backgroundColor: green[300],
    },
  }),
);

const AdminPage: I18nPage = ({ t, ...rest }): React.ReactElement => {
  const classes = useStyles({});
  // const [syncLoading, setSyncLoading] = useState<boolean>(false);
  // const [cacheLoading, setCacheLoading] = useState<boolean>(false);

  const [sync, { loading: syncLoading, error: errorsSynch }] = useMutation(SYNC, {
    // onCompleted() {
    //   setSyncLoading(false);
    // },
  });

  const [cache, { loading: cacheLoading, error: errorsCache }] = useMutation(CACHE, {
    // onCompleted() {
    //   setCacheLoading(false);
    // },
  });

  const [clearSettings, { loading: clearSettingsLoading, error: clearSettingsError }] = useMutation<
    UserSettings,
    { value: UserSettings }
  >(USER_SETTINGS, {
    // onCompleted() {
    //   setCacheLoading(false);
    // },
  });

  const handleSync = (): void => {
    // setSyncLoading(true);
    sync();
  };

  const handleCache = (): void => {
    // setCacheLoading(true);
    cache();
  };

  const handleClearSettings = (): void => {
    // setCacheLoading(true);
    clearSettings({
      variables: {
        value: defaultUserSettings,
      },
    });
  };

  useEffect(() => {
    if (errorsCache) {
      snackbarUtils.error(errorsCache);
    }

    if (errorsSynch) {
      snackbarUtils.error(errorsSynch);
    }

    if (clearSettingsError) {
      snackbarUtils.error(clearSettingsError);
    }
  }, [clearSettingsError, errorsCache, errorsSynch]);

  return (
    <>
      <Head>
        <title>{t('admin:title')}</title>
      </Head>
      <MaterialUI {...rest}>
        <div className={classes.root}>
          <Card className={classes.card}>
            <CardActions disableSpacing>
              <Button fullWidth disabled={syncLoading} color="secondary" onClick={handleSync}>
                {!syncLoading ? t('admin:sync:sync') : t('admin:sync:wait')}
              </Button>
            </CardActions>
            <CardContent>
              <Typography color="textSecondary" component="p">
                {t('admin:sync:description')}
              </Typography>
            </CardContent>
          </Card>
          <Card className={classes.card}>
            <CardActions disableSpacing>
              <Button fullWidth disabled={cacheLoading} color="secondary" onClick={handleCache}>
                {!cacheLoading ? t('admin:cache:cache') : t('admin:cache:wait')}
              </Button>
            </CardActions>
            <CardContent>
              <Typography color="textSecondary" component="p">
                {t('admin:cache:description')}
              </Typography>
            </CardContent>
          </Card>
          <Card className={classes.card}>
            <CardActions disableSpacing>
              <Button fullWidth disabled={clearSettingsLoading} color="secondary" onClick={handleClearSettings}>
                {!cacheLoading ? t('admin:clearSettings:clear') : t('admin:clearSettings:wait')}
              </Button>
            </CardActions>
            <CardContent>
              <Typography color="textSecondary" component="p">
                {t('admin:clearSettings:description')}
              </Typography>
            </CardContent>
          </Card>
        </div>
      </MaterialUI>
    </>
  );
};

AdminPage.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['admin']),
});

export default nextI18next.withTranslation('admin')(AdminPage);
