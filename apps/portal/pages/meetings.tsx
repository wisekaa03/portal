/** @format */

//#region Imports NPM
import React from 'react';
import Head from 'next/head';
import { makeStyles, createStyles } from '@material-ui/core/styles';
//#endregion
//#region Imports Local
import { includeDefaultNamespaces, nextI18next, I18nPage } from '@lib/i18n-client';
import { MaterialUI } from '@front/layout';
import Iframe from '@front/components/iframe';
//#endregion

const useStyles = makeStyles(() =>
  createStyles({
    root: {},
  }),
);

const MeetingsPage: I18nPage = ({ t, ...rest }): React.ReactElement => {
  const url = 'https://ww.kngk-group.ru/site3/';

  return (
    <>
      <Head>
        <title>{t('meeting:title')}</title>
      </Head>
      <MaterialUI {...rest}>
        <Iframe url={url} sandbox="allow-scripts allow-same-origin allow-forms allow-popups" />
      </MaterialUI>
    </>
  );
};

MeetingsPage.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['meeting']),
});

export default nextI18next.withTranslation('meeting')(MeetingsPage);
