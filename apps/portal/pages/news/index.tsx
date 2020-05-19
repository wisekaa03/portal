/** @format */

//#region Imports NPM
import React, { useState /* , useContext */ } from 'react';
import Head from 'next/head';
import clsx from 'clsx';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { QueryResult } from 'react-apollo';
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
import CloseIcon from '@material-ui/icons/Close';
//#endregion
//#region Imports Local
import { MaterialUI } from '@front/layout';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '@lib/i18n-client';
import { NEWS, NEWS_EDIT, NEWS_DELETE } from '@lib/queries';
import { format } from '@lib/dayjs';
import { LARGE_RESOLUTION } from '@lib/constants';
import { Data } from '@lib/types';
import Loading from '@front/components/loading';
import IsAdmin from '@front/components/isAdmin';
//#endregion

// TODO: Import jodit-react:
// import dynamic from 'next/dynamic';
// const importJodit = () => import('jodit-react');
// const JoditEditor = dynamic(importJodit, {
//     ssr: false,
// });

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
        gap: `${theme.spacing(4)}px`,
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
        padding: theme.spacing(0.5),
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

const NewsPage: I18nPage = ({ t, i18n, query, ...rest }): React.ReactElement => {
  const classes = useStyles({});
  const { loading, data, error }: QueryResult<Data<'news', NewsProps[]>> = useQuery(NEWS, { ssr: false });
  const [current, setCurrent] = useState<NewsProps>(null);
  // const profile = useContext(ProfileContext);

  const newsId = query?.id;

  const handleCurrent = (news: NewsProps) => (): void => {
    setCurrent(news);
  };

  const [editNews] = useMutation(NEWS_EDIT, {
    refetchQueries: [
      {
        query: NEWS,
      },
    ],
  });

  const [deleteNews] = useMutation(NEWS_DELETE, {
    refetchQueries: [
      {
        query: NEWS,
      },
    ],
  });

  const handleEdit = (news?: NewsProps) => (): void => {};

  const handleDelete = (news: NewsProps) => (): void => {
    if (news?.id) {
      deleteNews({ variables: { id: news.id } });
    }
  };

  const handleCloseCurrent = (): void => {
    setCurrent(null);
  };

  return (
    <>
      <Head>
        <title>{t('news:title')}</title>
      </Head>
      <MaterialUI {...rest}>
        <Loading activate={loading || !data || !data.news} noMargin type="linear" variant="indeterminate">
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
                    subheader={format(current.updatedAt, i18n)}
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
                {data?.news?.map((news: NewsProps) => {
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
                          {format(news.updatedAt, i18n)}
                        </Typography>
                        <IsAdmin>
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
                        </IsAdmin>
                        <IconButton size="small" color="secondary" onClick={handleCurrent(news)} aria-label="more">
                          <MoreIcon fontSize="small" />
                        </IconButton>
                      </CardActions>
                    </Card>
                  );
                })}
                <IsAdmin>
                  <Fab color="primary" className={classes.add} onClick={handleEdit()} aria-label="add">
                    <AddIcon />
                  </Fab>
                </IsAdmin>
              </div>
            </div>
          </div>
        </Loading>
      </MaterialUI>
    </>
  );
};

NewsPage.getInitialProps = ({ query }) => ({
  query,
  namespacesRequired: includeDefaultNamespaces(['news']),
});

export default nextI18next.withTranslation('news')(NewsPage);
