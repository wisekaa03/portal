/** @format */

// #region Imports NPM
import React from 'react';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { useQuery } from '@apollo/react-hooks';
import { Card, CardActionArea, CardMedia, Typography, CardContent, CardActions, Button } from '@material-ui/core';
import moment from 'moment';
// #endregion
// #region Imports Local
import Page from '../layouts/main';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '../lib/i18n-client';
import { NEWS } from '../lib/queries';
import { Loading } from '../components/loading';
// #endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
    },
    container: {
      display: 'grid',
      padding: theme.spacing(6),
      gridGap: theme.spacing(4),
      gridTemplateColumns: '1fr 1fr 1fr',
      gridAutoRows: 'minmax(300px, 1fr)',
    },
    card: {
      display: 'flex',
      flexDirection: 'column',
    },
    action: {
      'flex': 1,
      'justifyContent': 'space-between',
      'alignItems': 'flex-end',
      '& p': {
        padding: theme.spacing() / 2,
      },
    },
  }),
);

const News: I18nPage = ({ t, ...rest }): React.ReactElement => {
  const classes = useStyles({});
  const { loading, data, error } = useQuery(NEWS);
  moment.locale('ru');

  return (
    <Page {...rest}>
      <div className={classes.root}>
        {loading || !data || !data.news ? (
          <Loading noMargin type="linear" variant="indeterminate" />
        ) : (
          <div className={classes.container}>
            {data.news.map((news) => {
              // TODO: regexp может быть улучшен
              const images = news.content.rendered.match(/(http)?s?:?(\/\/[^"']*\.(?:png|jpg|jpeg|gif|png|svg))/gi);

              return (
                <Card key={news.id} className={classes.card}>
                  <CardActionArea>
                    <CardMedia component="img" height={200} image={images ? images[0] : null} />
                    <CardContent>
                      <Typography variant="body2" color="textSecondary" component="p">
                        {news.title.rendered}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                  <CardActions className={classes.action}>
                    <Typography variant="body2" color="textSecondary" component="p">
                      {moment(news.date).format('MMMM DD, YYYY')}
                    </Typography>
                    <Button size="small" color="secondary">
                      {t('news:more')}
                    </Button>
                  </CardActions>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Page>
  );
};

News.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['news']),
});

export default nextI18next.withTranslation('news')(News);
