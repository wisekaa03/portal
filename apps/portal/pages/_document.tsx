/** @format */

// #region Imports NPM
import React from 'react';
import { IncomingMessage } from 'http';
import Document, { Html, Head, Main, NextScript, DocumentInitialProps } from 'next/document';
import { ServerStyleSheets } from '@material-ui/styles';
import { ApolloClient } from 'apollo-client';
import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import { lngFromReq } from 'next-i18next/dist/commonjs/utils';
// #endregion
// #region Imports Local
import { ApolloDocumentProps } from '@lib/types';
import theme from '@lib/theme';
import { nextI18next } from '@lib/i18n-client';
// #endregion

// Resolution order
//
// On the server:
// 1. app.getInitialProps
// 2. page.getInitialProps
// 3. document.getInitialProps
// 4. app.render
// 5. page.render
// 6. document.render
//
// On the server with error:
// 1. document.getInitialProps
// 2. app.render
// 3. page.render
// 4. document.render
//
// On the client
// 1. app.getInitialProps
// 2. page.getInitialProps
// 3. app.render
// 4. page.render

interface MainDocumentInitialProps extends DocumentInitialProps {
  apolloClient: ApolloClient<NormalizedCacheObject>;
  currentLanguage: string | undefined;
  nonce?: string;
  req?: IncomingMessage;
}

class MainDocument extends Document<MainDocumentInitialProps> {
  render(): React.ReactElement {
    const { /* nonce, */ currentLanguage } = this.props;

    return (
      <Html lang={currentLanguage} dir="ltr">
        {/* nonce={nonce} */}
        <Head>
          <meta charSet="utf-8" />
          <meta name="Description" content="Портал" />
          {/* TODO: временно запрещаем индексацию */}
          <meta name="robots" content="noindex" />
          <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no" />
          {/* <meta property="csp-nonce" content={this.props.nonce} /> */}
          <meta name="theme-color" content={theme.palette.primary.main} />
        </Head>
        <body>
          <Main />
          {/* nonce={nonce} */}
          <NextScript />
        </body>
      </Html>
    );
  }

  static async getInitialProps(ctx: ApolloDocumentProps): Promise<MainDocumentInitialProps> {
    const sheets = new ServerStyleSheets();
    const { apolloClient, renderPage: originalRenderPage, req } = ctx;

    const lng = req && lngFromReq(req);

    ctx.renderPage = () =>
      originalRenderPage({
        enhanceApp: (App) => (props) => sheets.collect(<App {...props} />),
      });

    // Run the parent `getInitialProps` using `ctx` that now includes our custom `renderPage`
    const initialProps = await Document.getInitialProps(ctx);

    // const nonce = res && (res as any).locals && (res as any).locals.nonce;
    const currentLanguage = lng || nextI18next.i18n.language || nextI18next.config.defaultLanguage;

    return {
      apolloClient,
      ...initialProps,
      currentLanguage,
      // nonce,
      // Styles fragment is rendered after the app and page rendering finish.
      styles: [...React.Children.toArray(initialProps.styles), sheets.getStyleElement()],
    };
  }
}

export default MainDocument;
