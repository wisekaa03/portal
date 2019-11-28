/** @format */

// #region Imports NPM
import React from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import { useQuery } from '@apollo/react-hooks';
// #endregion
// #region Imports Local
import Page from '../layouts/main';
// import Iframe from '../components/iframe';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '../lib/i18n-client';
import { NEWS } from '../lib/queries';
// #endregion

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      // display: 'block',
      // border: 'none',
      // height: '100%',
      // width: '100%',
    },
  }),
);

const News: I18nPage = (props): React.ReactElement => {
  const classes = useStyles({});
  // const url = 'https://i-npz.ru/kngk/portal/portal_news/';
  const { loading, data, error } = useQuery(NEWS);

  return (
    <Page {...props}>
      <div>{JSON.stringify(data)}</div>
    </Page>
  );
};

News.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['news']),
});

export default nextI18next.withTranslation('news')(News);
