/** @format */

// #region Imports NPM
import React from 'react';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { Card, CardContent, Button } from '@material-ui/core';
import { useMutation } from '@apollo/react-hooks';
import Head from 'next/head';
// #endregion
// #region Imports Local
import Page from '../layouts/main';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '../lib/i18n-client';
import { SYNC, CACHE, SOAP1CSYNCH } from '../lib/queries';
import { GQLError } from '../components/gql-error';
// #endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    // root: {
    //   padding: theme.spacing(2),
    //   display: 'grid',
    //   gridTemplateColumns: '500px',
    //   height: 'fit-content',
    //   gridGap: theme.spacing(),
    // },
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
  // const [soap1cLoading, setSoap1cLoading] = useState<boolean>(false);
  // const [cacheLoading, setCacheLoading] = useState<boolean>(false);

  const [sync, { loading: syncLoading, error: errorsSynch }] = useMutation(SYNC, {
    // onCompleted() {
    //   setSyncLoading(false);
    // },
  });

  const [soap1c, { loading: soap1cLoading, error: errorsSoap1c }] = useMutation(SOAP1CSYNCH, {
    // onCompleted() {
    //   setSoap1cLoading(false);
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

  const handleSoap1c = (): void => {
    // setSoap1cLoading(true);
    soap1c();
  };

  return (
    <>
      <Head>
        <title>{t('admin:title')}</title>
      </Head>
      <Page {...props}>
        <Card className={classes.card}>
          <CardContent>
            <Button
              disabled={syncLoading}
              variant="contained"
              color="secondary"
              className={classes.buttonSync}
              onClick={handleSync}
            >
              {!syncLoading ? t('admin:synch:synch') : t('admin:synch:wait')}
            </Button>
            {errorsSynch && <GQLError error={errorsSynch} />}
          </CardContent>
        </Card>
        <Card className={classes.card}>
          <CardContent>
            <Button
              disabled={cacheLoading}
              variant="contained"
              color="secondary"
              className={classes.buttonCache}
              onClick={handleCache}
            >
              {!cacheLoading ? t('admin:cache:cache') : t('admin:cache:wait')}
            </Button>
            {errorsCache && <GQLError error={errorsCache} />}
          </CardContent>
        </Card>
        <Card className={classes.card}>
          <CardContent>
            <Button
              disabled={soap1cLoading}
              variant="contained"
              color="secondary"
              className={classes.buttonSoap}
              onClick={handleSoap1c}
            >
              {!soap1cLoading ? t('admin:soap1c:synch') : t('admin:soap1c:wait')}
            </Button>
            {errorsSoap1c && <GQLError error={errorsSoap1c} />}
          </CardContent>
        </Card>
      </Page>
    </>
  );
};

AdminPanel.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['admin']),
});

export default nextI18next.withTranslation('admin')(AdminPanel);
