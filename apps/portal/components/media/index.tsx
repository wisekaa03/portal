/** @format */

// #region Imports NPM
import React, { FC } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import {
  Box,
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
import { MediaComponentProps } from './types';
import IsAdmin from '../isAdmin';
import { useTranslation } from '../../lib/i18n-client';
import { Loading } from '../loading';
import { format } from '../../lib/dayjs';
import { LARGE_RESOLUTION } from '../../lib/constants';
// #endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    selected: {
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
    card: {
      display: 'flex',
      flexDirection: 'column',
    },
    cardCurrent: {
      flexGrow: 1,
      height: 'fit-content',
    },
    content: {
      'padding': theme.spacing(),
      '& img': {
        maxWidth: '100%',
        height: 'auto',
      },
    },
    action: {
      'flex': 1,
      'justifyContent': 'space-between',
      'alignItems': 'flex-end',
      '& p': {
        padding: theme.spacing(0.5),
      },
    },
    icons: {
      marginLeft: 'auto !important',
    },
    fab: {
      position: 'absolute',
      bottom: theme.spacing(2),
      right: 18 + theme.spacing(2),
    },
  }),
);

const MediaComponent: FC<MediaComponentProps> = ({
  loading,
  current,
  data,
  handleCurrent,
  handleCloseCurrent,
  handleDelete,
}) => {
  const classes = useStyles({});
  const { i18n } = useTranslation();
  return (
    <Loading activate={loading || !data} noMargin type="linear" variant="indeterminate">
      <Box
        display="grid"
        className={clsx({
          [classes.selected]: current,
        })}
      >
        {current && (
          <Box display="flex" overflow={['hidden', 'auto']} padding={4}>
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
                  dangerouslySetInnerHTML={{ __html: current.file }}
                />
              </CardContent>
            </Card>
          </Box>
        )}
        <div className={classes.container}>
          <div>
            {data &&
              data.map((media) => {
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
                        {format(media.updatedAt, i18n)}
                      </Typography>
                      <IsAdmin>
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
                          href={{ pathname: '/media/edit', query: { id: media?.id } }}
                          as={`/media/edit?id=${media?.id}`}
                          passHref
                        >
                          <IconButton size="small" color="secondary" aria-label="edit">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Link>
                      </IsAdmin>
                      <IconButton size="small" color="secondary" onClick={handleCurrent(media)} aria-label="more">
                        <MoreIcon fontSize="small" />
                      </IconButton>
                    </CardActions>
                  </Card>
                );
              })}
            <Link href={{ pathname: '/media/edit' }} as="/media/edit" passHref>
              <Fab color="primary" className={classes.fab} aria-label="add">
                <AddIcon />
              </Fab>
            </Link>
          </div>
        </div>
      </Box>
    </Loading>
  );
};

export default MediaComponent;
