/** @format */

// #region Imports NPM
import React, { useState, useContext } from 'react';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { useQuery, useMutation } from '@apollo/react-hooks';
import {
  Card,
  CardActionArea,
  CardMedia,
  CardHeader,
  Typography,
  CardContent,
  CardActions,
  Fab,
  IconButton,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import MoreIcon from '@material-ui/icons/MoreHoriz';
import Head from 'next/head';
import clsx from 'clsx';
import CloseIcon from '@material-ui/icons/Close';
// #endregion
// #region Imports Local
import Page from '../../layouts/main';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '../../lib/i18n-client';
import { NEWS, NEWS_EDIT, NEWS_DELETE } from '../../lib/queries';
import { Loading } from '../../components/loading';
import dayjs from '../../lib/dayjs';
import { LARGE_RESOLUTION } from '../../lib/constants';
import { ProfileContext } from '../../lib/context';
// #endregion

const DATE_FORMAT = 'MMMM DD, YYYY';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'grid',
    },
    rootSelected: {
      [`@media (min-width:${LARGE_RESOLUTION}px)`]: {
        gridTemplateColumns: '5fr 2fr',
      },
      '& $container': {
        'display': 'grid',
        'flex': 1,
        '& > div': {
          gridTemplateColumns: '1fr',
          padding: theme.spacing(4),
          [`@media (max-width:${LARGE_RESOLUTION - 1}px)`]: {
            display: 'none',
          },
        },
      },
    },
    container: {
      'overflow': 'auto',
      '& > div': {
        display: 'grid',
        gridTemplateColumns: '1fr',
        padding: theme.spacing(6),
        gridGap: theme.spacing(4),
        gridAutoRows: 'max-content',
        overflowX: 'hidden',
        overflowY: 'auto',
        [theme.breakpoints.up('md')]: {
          gridTemplateColumns: '1fr 1fr',
        },
        [theme.breakpoints.up('lg')]: {
          gridTemplateColumns: '1fr 1fr 1fr',
        },
      },
    },
    containerCurrent: {
      display: 'flex',
      overflowX: 'hidden',
      overflowY: 'auto',
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
      'padding': theme.spacing(),
      '& img': {
        maxWidth: '100%',
        height: 'auto',
      },
    },
    icons: {
      marginLeft: 'auto !important',
    },
    add: {
      position: 'absolute',
      bottom: theme.spacing(2),
      right: 18 + theme.spacing(2),
    },
  }),
);

interface NewsProps {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  content: string;
  excerpt: string;
}

const News: I18nPage = (props): React.ReactElement => {
  const { t } = props;
  const classes = useStyles({});
  const { loading, data, error } = useQuery(NEWS);
  const [current, setCurrent] = useState<NewsProps>(null);
  const profile = useContext(ProfileContext);

  const handleCurrent = (news: NewsProps) => (): void => {
    setCurrent(news);
  };

  const [editNews] = useMutation(NEWS_EDIT, {
    refetchQueries: [
      {
        query: NEWS,
      },
    ],
    awaitRefetchQueries: true,
  });

  const [deleteNews] = useMutation(NEWS_DELETE, {
    refetchQueries: [
      {
        query: NEWS,
      },
    ],
    awaitRefetchQueries: true,
  });

  const handleEdit = (news?: NewsProps) => (): void => {};

  const handleDelete = (news: NewsProps) => (): void => {
    if (news && news.id) {
      deleteNews({ variables: { id: news.id } });
    }
  };

  const handleCloseCurrent = (): void => {
    setCurrent(null);
  };

  return (
    <Page {...props}>
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
          {current && (
            <div className={classes.containerCurrent}>
              <Card className={classes.cardCurrent}>
                <CardHeader
                  action={
                    <IconButton aria-label="close" onClick={handleCloseCurrent}>
                      <CloseIcon />
                    </IconButton>
                  }
                  title={current.title}
                  subheader={dayjs(current.updatedAt).format(DATE_FORMAT)}
                />
                <CardContent>
                  <div
                    className={classes.content}
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: current.content }}
                  />
                </CardContent>
              </Card>
            </div>
          )}
          <div className={classes.container}>
            <div>
              {data.news.map((news: NewsProps) => {
                // TODO: regexp может быть улучшен
                const images = news.content.match(/(http)?s?:?(\/\/[^"']*\.(?:png|jpg|jpeg|gif|png|svg))/gi);
                const anchor = `news-${news.id}`;

                return (
                  <Card id={anchor} key={news.id} className={classes.card}>
                    <CardActionArea onClick={handleCurrent(news)}>
                      <CardMedia component="img" height={current ? 150 : 200} image={images ? images[0] : null} />
                      <CardContent>
                        <Typography variant="body2" color="textSecondary" component="p">
                          {news.title}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                    <CardActions className={classes.action}>
                      <Typography variant="body2" color="textSecondary" component="p">
                        {dayjs(news.updatedAt).format(DATE_FORMAT)}
                      </Typography>
                      {profile.user && profile.user.isAdmin && (
                        <>
                          <IconButton
                            className={classes.icons}
                            size="small"
                            color="secondary"
                            onClick={handleDelete(news)}
                            aria-label="delete"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="secondary" onClick={handleEdit(news)} aria-label="edit">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </>
                      )}
                      <IconButton size="small" color="secondary" onClick={handleCurrent(news)} aria-label="more">
                        <MoreIcon fontSize="small" />
                      </IconButton>
                    </CardActions>
                  </Card>
                );
              })}
              {profile.user && profile.user.isAdmin && (
                <Fab color="primary" className={classes.add} onClick={handleEdit()} aria-label="add">
                  <AddIcon />
                </Fab>
              )}
            </div>
          </div>
        </div>
      )}
    </Page>
  );
};

News.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['news']),
});

export default nextI18next.withTranslation('news')(News);
