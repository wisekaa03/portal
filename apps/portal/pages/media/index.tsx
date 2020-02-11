/** @format */

// #region Imports NPM
import React, { useState, useContext } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import clsx from 'clsx';
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
import CloseIcon from '@material-ui/icons/Close';
// #endregion
// #region Imports Local
import Page from '../../layouts/main';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '../../lib/i18n-client';
import { MEDIA, MEDIA_EDIT, MEDIA_DELETE } from '../../lib/queries';
import { Loading } from '../../components/loading';
import dayjs from '../../lib/dayjs';
import { LARGE_RESOLUTION, DATE_FORMAT } from '../../lib/constants';
import { ProfileContext } from '../../lib/context';
// #endregion

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

interface MediaProps {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  file: string;
  content: Buffer;
}

const Media: I18nPage = (props): React.ReactElement => {
  const { t, i18n } = props;
  const classes = useStyles({});
  const { loading, data, error } = useQuery(MEDIA, {
    fetchPolicy: 'cache-first',
  });
  const [current, setCurrent] = useState<MediaProps>(null);
  const profile = useContext(ProfileContext);
  const router = useRouter();
  // const mediaId = router && router.query && router.query.id;

  const handleCurrent = (media: MediaProps) => (): void => {
    setCurrent(media);
  };

  const [deleteMedia] = useMutation(MEDIA_DELETE, {
    refetchQueries: [
      {
        query: MEDIA,
      },
    ],
    awaitRefetchQueries: true,
  });

  const handleDelete = (media: MediaProps) => (): void => {
    if (media && media.id) {
      deleteMedia({ variables: { id: media.id } });
    }
  };

  const handleCloseCurrent = (): void => {
    setCurrent(null);
  };

  // eslint-disable-next-line no-debugger
  // debugger;

  return (
    <Page {...props}>
      <Head>
        <title>{t('media:title')}</title>
      </Head>
      {loading || !data || !data.media ? (
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
                  subheader={dayjs(current.updatedAt).format(DATE_FORMAT(i18n))}
                />
                <CardContent>
                  <div
                    className={classes.content}
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: current.file }}
                  />
                </CardContent>
              </Card>
            </div>
          )}
          <div className={classes.container}>
            <div>
              {data.media.map((media: MediaProps) => {
                // TODO: regexp может быть улучшен
                const anchor = `media-${media.id}`;

                return (
                  <Card id={anchor} key={media.id} className={classes.card}>
                    <CardActionArea onClick={handleCurrent(media)}>
                      <CardMedia
                        component="img"
                        height={current ? 150 : 200}
                        // image={media.content ? media.content : null}
                      />
                      <CardContent>
                        <Typography variant="body2" color="textSecondary" component="p">
                          {media.title}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                    <CardActions className={classes.action}>
                      <Typography variant="body2" color="textSecondary" component="p">
                        {dayjs(media.updatedAt).format(DATE_FORMAT(i18n))}
                      </Typography>
                      {profile.user && profile.user.isAdmin && (
                        <>
                          <IconButton
                            className={classes.icons}
                            size="small"
                            color="secondary"
                            onClick={handleDelete(media)}
                            aria-label="delete"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                          <Link
                            href={{ pathname: '/media/edit', query: { id: media && media.id } }}
                            as={`/media/edit?id=${media && media.id}`}
                            passHref
                          >
                            <IconButton size="small" color="secondary" aria-label="edit">
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Link>
                        </>
                      )}
                      <IconButton size="small" color="secondary" onClick={handleCurrent(media)} aria-label="more">
                        <MoreIcon fontSize="small" />
                      </IconButton>
                    </CardActions>
                  </Card>
                );
              })}
              <Link href={{ pathname: '/media/edit' }} as="/media/edit" passHref>
                <Fab color="primary" className={classes.add} aria-label="add">
                  <AddIcon />
                </Fab>
              </Link>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
};

Media.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['media']),
});

export default nextI18next.withTranslation('news')(Media);
