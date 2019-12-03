/** @format */

// #region Imports NPM
import React, { useState } from 'react';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { useQuery } from '@apollo/react-hooks';
import {
  Card,
  CardActionArea,
  CardMedia,
  CardHeader,
  Typography,
  CardContent,
  CardActions,
  Button,
  IconButton,
} from '@material-ui/core';
import AutoSizer from 'react-virtualized-auto-sizer';
import Head from 'next/head';
import clsx from 'clsx';
import CloseIcon from '@material-ui/icons/Close';
// #endregion
// #region Imports Local
import Page from '../layouts/main';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '../lib/i18n-client';
import { NEWS } from '../lib/queries';
import { Loading } from '../components/loading';
import moment from '../lib/moment';
// #endregion

const DATE_FORMAT = 'MMMM DD, YYYY';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'grid',
      // flexDirection: 'column',
    },
    rootSelected: {
      gridTemplateColumns: '2fr 5fr',
    },
    container: {
      'display': 'grid',
      'padding': theme.spacing(6),
      'gridGap': theme.spacing(4),
      'gridTemplateColumns': '1fr 1fr 1fr',
      'gridAutoRows': 'max-content',
      'overflowX': 'hidden',
      'overflowY': 'auto',
      '& > div:last-child': {
        marginBottom: theme.spacing(6),
      },
    },
    containerSelected: {
      'gridTemplateColumns': '1fr',
      'padding': theme.spacing(4),
      '& > div:last-child': {
        marginBottom: theme.spacing(4),
      },
    },
    containerCurrent: {
      display: 'flex',
      overflowX: 'hidden',
      overflowY: 'auto',
      // flexGrow: 1,
      padding: theme.spacing(4),
    },
    card: {
      display: 'flex',
      flexDirection: 'column',
    },
    cardCurrent: {
      flexGrow: 1,
      height: 'fit-content',
    },
    action: {
      'flex': 1,
      'justifyContent': 'space-between',
      'alignItems': 'flex-end',
      '& p': {
        padding: theme.spacing() / 2,
      },
    },
    content: {
      '& img': {
        width: '100%',
        height: 'auto',
      },
    },
  }),
);

interface Rendered {
  rendered: string;
  protected: boolean;
}

interface NewsProps {
  id: string;
  date: string;
  title: Rendered;
  content: Rendered;
  excerpt: Rendered;
}

const News: I18nPage = ({ t, ...rest }): React.ReactElement => {
  const classes = useStyles({});
  const { loading, data, error } = useQuery(NEWS);
  const [current, setCurrent] = useState(null);

  const handleCurrent = (news: NewsProps) => (): void => {
    setCurrent(news);
  };

  const handleCloseCurrent = (): void => {
    setCurrent(null);
  };

  console.log(current);

  return (
    <Page {...rest}>
      <Head>
        <title>{t('news:title')}</title>
      </Head>
      {loading || !data || !data.news ? (
        <Loading noMargin type="linear" variant="indeterminate" />
      ) : (
        <div
          className={clsx(classes.root, {
            [classes.rootSelected]: current,
          })}
        >
          <div>
            <AutoSizer style={{ flexGrow: 1 }}>
              {({ height, width }) => (
                <div
                  className={clsx(classes.container, {
                    [classes.containerSelected]: current,
                  })}
                  style={{ height, width }}
                >
                  {data.news.map((news: NewsProps) => {
                    // TODO: regexp может быть улучшен
                    const images = news.content.rendered.match(
                      /(http)?s?:?(\/\/[^"']*\.(?:png|jpg|jpeg|gif|png|svg))/gi,
                    );
                    const anchor = `news-${news.id}`;

                    return (
                      <Card id={anchor} key={news.id} className={classes.card}>
                        <CardActionArea onClick={handleCurrent(news)}>
                          <CardMedia component="img" height={current ? 150 : 200} image={images ? images[0] : null} />
                          <CardContent>
                            <Typography variant="body2" color="textSecondary" component="p">
                              {news.title.rendered}
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                        <CardActions className={classes.action}>
                          <Typography variant="body2" color="textSecondary" component="p">
                            {moment(news.date).format(DATE_FORMAT)}
                          </Typography>
                          <Button size="small" color="secondary" onClick={handleCurrent(news)}>
                            {t('news:more')}
                          </Button>
                        </CardActions>
                      </Card>
                    );
                  })}
                </div>
              )}
            </AutoSizer>
          </div>
          {current && (
            <div>
              <AutoSizer style={{ flexGrow: 1 }}>
                {({ height, width }) => (
                  <div className={classes.containerCurrent} style={{ height, width }}>
                    <Card className={classes.cardCurrent}>
                      <CardHeader
                        action={
                          <IconButton aria-label="close" onClick={handleCloseCurrent}>
                            <CloseIcon />
                          </IconButton>
                        }
                        title={current.title.rendered}
                        subheader={moment(current.date).format(DATE_FORMAT)}
                      />
                      <CardContent>
                        <div
                          className={classes.content}
                          dangerouslySetInnerHTML={{ __html: current.content.rendered }}
                        />
                      </CardContent>
                    </Card>
                  </div>
                )}
              </AutoSizer>
            </div>
          )}
        </div>
      )}
    </Page>
  );
};

News.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['news']),
});

export default nextI18next.withTranslation('news')(News);
