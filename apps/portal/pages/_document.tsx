/** @format */

//#region Imports NPM
import React from 'react';
import Document, { Html, Head, Main, NextScript, DocumentInitialProps } from 'next/document';
import { ServerStyleSheets } from '@material-ui/styles';
import { lngFromReq } from 'next-i18next/dist/commonjs/utils';
import { Response } from 'express';
//#endregion
//#region Imports Local
import { DocumentContextMy, DocumentInitialPropsMy } from '@lib/types';
import { MaterialUI_primary_main } from '@lib/theme';
import { nextI18next } from '@lib/i18n-client';
//#endregion

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

class MainDocument extends Document<DocumentInitialPropsMy> {
  render(): React.ReactElement {
    const { nonce, language } = this.props;

    return (
      <Html lang={language} dir="ltr">
        <Head>
          <meta charSet="utf-8" />
          <meta name="Description" content="Корпоративный портал" />
          {/* TODO: временно запрещаем индексацию */}
          <meta name="robots" content="noindex" />
          <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no" />
          <meta property="csp-nonce" content={nonce} />
          <meta name="theme-color" content={MaterialUI_primary_main} />
        </Head>
        <body>
          <Main />
          <NextScript nonce={nonce} />
        </body>
      </Html>
    );
  }

  static async getInitialProps(ctx: DocumentContextMy): Promise<DocumentInitialPropsMy> {
    const sheets = new ServerStyleSheets();
    const { renderPage: originalRenderPage, req, res } = ctx;

    ctx.renderPage = () =>
      originalRenderPage({
        enhanceApp: (App) => (props) => sheets.collect(<App {...props} />),
      });

    // Run the parent `getInitialProps` using `ctx` that now includes our custom `renderPage`
    const initialProps = await Document.getInitialProps(ctx);

    const nonce = (res as Response)?.locals?.nonce;

    return {
      ...initialProps,
      language: ctx.language || lngFromReq(req) || nextI18next.i18n.language || nextI18next.config.defaultLanguage,
      nonce,
      // Styles fragment is rendered after the app and page rendering finish.
      styles: [...React.Children.toArray(initialProps.styles), sheets.getStyleElement()],
    };
  }
}

export default MainDocument;
