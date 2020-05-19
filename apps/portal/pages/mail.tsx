/** @format */

//#region Imports NPM
import React from 'react';
import Head from 'next/head';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import queryString from 'query-string';
//#endregion
//#region Imports Local
import { MaterialUI } from '@front/layout';
import Iframe from '@front/components/iframe';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '@lib/i18n-client';
//#endregion

const useStyles = makeStyles(() =>
  createStyles({
    root: {},
  }),
);

const MailPage: I18nPage = ({ t, ...rest }): React.ReactElement => {
  const { to } = __SERVER__ ? { to: false } : queryString.parse(window.location.search);
  const url = `${process.env.MAIL_URL}${to ? `?_task=mail&_action=compose&to=${to}` : ''}`;

  return (
    <>
      <Head>
        <title>{t('mail:title')}</title>
      </Head>
      <MaterialUI {...rest}>
        <Iframe
          url={url}
          // eslint-disable-next-line max-len
          sandbox="allow-scripts allow-same-origin allow-top-navigation allow-forms allow-popups allow-pointer-lock allow-popups-to-escape-sandbox"
        />
      </MaterialUI>
    </>
  );
};

MailPage.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['mail']),
});

export default nextI18next.withTranslation('mail')(MailPage);
