/** @format */

// #region Imports NPM
import React, { useEffect } from 'react';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { Card, CardContent, Button, CardActions, Typography } from '@material-ui/core';
import { useMutation } from '@apollo/react-hooks';
import Head from 'next/head';
// #endregion
// #region Imports Local
import Page from '../layouts/main';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '../lib/i18n-client';
import { SYNC, CACHE } from '../lib/queries';
import snackbarUtils from '../lib/snackbar-utils';
// #endregion

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

const AdminPanel: I18nPage = (props): React.ReactElement => {
  const { t } = props;
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

  const handleSync = (): void => {
    // setSyncLoading(true);
    sync();
  };

  const handleCache = (): void => {
    // setCacheLoading(true);
    cache();
  };

  useEffect(() => {
    if (errorsCache) {
      snackbarUtils.error(errorsCache);
    }

    if (errorsSynch) {
      snackbarUtils.error(errorsSynch);
    }
  }, [errorsCache, errorsSynch]);

  return (
    <>
      <Head>
        <title>{t('admin:title')}</title>
      </Head>
      <Page {...props}>
        <div className={classes.root}>
          <Card className={classes.card}>
            <CardActions disableSpacing>
              <Button fullWidth disabled={syncLoading} color="secondary" onClick={handleSync}>
                {!syncLoading ? t('admin:synch:synch') : t('admin:synch:wait')}
              </Button>
            </CardActions>
            <CardContent>
              <Typography color="textSecondary" component="p">
                {t('admin:synch:description')}
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
        </div>
      </Page>
    </>
  );
};

AdminPanel.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['admin']),
});

export default nextI18next.withTranslation('admin')(AdminPanel);
