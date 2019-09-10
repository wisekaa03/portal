/** @format */

// #region Imports NPM
import React from 'react';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import Document, { Head, Main, NextScript } from 'next/document';
import { ServerStyleSheets } from '@material-ui/styles';
// #endregion
// #region Imports Local
import { ApolloDocumentProps } from '../lib/types';
import theme from '../lib/theme';
// #endregion

// You can find a benchmark of the available CSS minifiers under
// https://github.com/GoalSmashers/css-minification-benchmark
// We have found that clean-css is faster than cssnano but the output is larger.
// Waiting for https://github.com/cssinjs/jss/issues/279
// 4% slower but 12% smaller output than doing it in a single step.
const prefixer = postcss([autoprefixer, cssnano] as postcss.AcceptedPlugin[]);

class MainDocument extends Document {
  render(): React.ReactElement {
    return (
      <html lang="en" dir="ltr">
        <Head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no" />
          <meta name="theme-color" content={theme.palette.primary.main} />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    );
  }
}

MainDocument.getInitialProps = async (ctx: ApolloDocumentProps) => {
  const sheets = new ServerStyleSheets();
  const { apolloClient, renderPage: originalRenderPage } = ctx;

  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: (App) => (props) => sheets.collect(<App {...props} />),
    });

  const initialProps = await Document.getInitialProps(ctx);

  const minifiedStyles = await prefixer
    .process(sheets.toString(), { from: undefined })
    .then((result: any) => result.css);

  return {
    apolloClient,
    ...initialProps,
    // Styles fragment is rendered after the app and page rendering finish.
    styles: [
      <React.Fragment key="styles">
        {initialProps.styles}
        <style
          id="jss"
          key="jss"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: minifiedStyles }}
        />
      </React.Fragment>,
    ],
  };
};

export default MainDocument;
