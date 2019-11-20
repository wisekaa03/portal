/** @format */

// #region Imports NPM
import React, { useState } from 'react';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { Button, Paper, Typography } from '@material-ui/core';
import { useMutation } from '@apollo/react-hooks';
import { green } from '@material-ui/core/colors';
// #endregion
// #region Imports Local
import Page from '../layouts/main';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '../lib/i18n-client';
import { SYNC, CACHE } from '../lib/queries';
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
    buttonSync: {
      backgroundColor: green[300],
    },
    buttonCache: {
      backgroundColor: green[200],
    },
  }),
);

const AdminPanel: I18nPage = ({ t, ...rest }): React.ReactElement => {
  const classes = useStyles({});
  const [syncLoading, setSyncLoading] = useState<boolean>(false);
  const [cacheLoading, setCacheLoading] = useState<boolean>(false);

  const [sync] = useMutation(SYNC, {
    onCompleted() {
      setSyncLoading(false);
    },
  });

  const [cache] = useMutation(CACHE, {
    onCompleted() {
      setCacheLoading(false);
    },
  });

  const handleSync = (): void => {
    setSyncLoading(true);
    sync();
  };

  const handleCache = (): void => {
    setCacheLoading(true);
    cache();
  };

  return (
    <Page {...rest}>
      <div className={classes.root}>
        <Button disabled={syncLoading} variant="contained" className={classes.buttonSync} onClick={handleSync}>
          {!syncLoading ? t('common:synch') : t('common:synchWait')}
        </Button>
        <Button disabled={cacheLoading} variant="contained" className={classes.buttonCache} onClick={handleCache}>
          {!cacheLoading ? t('common:cache') : t('common:cacheWait')}
        </Button>
      </div>
    </Page>
  );
};

AdminPanel.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['admin']),
});

export default nextI18next.withTranslation('admin')(AdminPanel);
