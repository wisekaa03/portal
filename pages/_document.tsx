/** @format */

// #region Imports NPM
import React from 'react';
import { IncomingMessage } from 'http';
// import postcss from 'postcss';
// import autoprefixer from 'autoprefixer';
// import cssnano from 'cssnano';
import Document, { Html, Head, Main, NextScript, DocumentInitialProps } from 'next/document';
import { ServerStyleSheets } from '@material-ui/styles';
import { ApolloClient } from 'apollo-client';
import { NormalizedCacheObject } from 'apollo-cache-inmemory';
// #endregion
// #region Imports Local
import { ApolloDocumentProps } from '../lib/types';
import theme from '../lib/theme';
import { nextI18next } from '../lib/i18n-client';
// #endregion

// const minifier = postcss([/* autoprefixer,  */ cssnano]);
// const postCssOptions = { from: undefined };

interface MainDocumentInitialProps extends DocumentInitialProps {
  apolloClient: ApolloClient<NormalizedCacheObject>;
  currentLanguage: string | undefined;
  nonce: string;
  req?: IncomingMessage;
}

// You can find a benchmark of the available CSS minifiers under
// https://github.com/GoalSmashers/css-minification-benchmark
// We have found that clean-css is faster than cssnano but the output is larger.
// Waiting for https://github.com/cssinjs/jss/issues/279
// 4% slower but 12% smaller output than doing it in a single step.
// const prefixer = postcss([autoprefixer, cssnano] as postcss.AcceptedPlugin[]);

class MainDocument extends Document<MainDocumentInitialProps> {
  render(): React.ReactElement {
    const { nonce } = this.props;

    return (
      <Html lang={this.props.currentLanguage} dir="ltr">
        <Head nonce={nonce}>
          <meta charSet="utf-8" />
          <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no" />
          {/* <meta property="csp-nonce" content={this.props.nonce} /> */}
          <meta name="theme-color" content={theme.palette.primary.main} />
        </Head>
        <body>
          <Main />
          <NextScript nonce={nonce} />
        </body>
      </Html>
    );
  }
}

MainDocument.getInitialProps = async (ctx: ApolloDocumentProps): Promise<MainDocumentInitialProps> => {
  const sheets = new ServerStyleSheets();
  const { apolloClient, renderPage: originalRenderPage, res, req } = ctx;

  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: (App) => (props) => sheets.collect(<App {...props} />),
    });

  // Run the parent `getInitialProps` using `ctx` that now includes our custom `renderPage`
  const initialProps = await Document.getInitialProps(ctx);
  const nonce = res && (res as any).locals && (res as any).locals.nonce;

  // let minifiedStyles;
  // if (process.env.NODE_ENV === 'production') {
  //   minifiedStyles = await minifier.process(sheets.toString(), postCssOptions).then((result: any) => result.css);
  // } else {
  //   minifiedStyles = sheets.toString();
  // }
  const minifiedStyles = sheets.toString();

  const currentLanguage = req
    ? ((req as unknown) as Express.Request).lng
      ? ((req as unknown) as Express.Request).lng
      : nextI18next.i18n.language || nextI18next.config.defaultLanguage
    : nextI18next.i18n.language || nextI18next.config.defaultLanguage;

  return {
    apolloClient,
    ...initialProps,
    currentLanguage,
    nonce,
    // Styles fragment is rendered after the app and page rendering finish.
    styles: [
      <React.Fragment key="styles">
        {initialProps.styles}
        <style
          id="jss"
          key="jss"
          nonce={nonce}
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: minifiedStyles }}
        />
      </React.Fragment>,
    ],
  };
};

export default MainDocument;
