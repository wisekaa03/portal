/** @format */

// #region Imports NPM
import React, { FC } from 'react';
import { fade, Theme, makeStyles, createStyles, withStyles } from '@material-ui/core/styles';
import {
  Box,
  IconButton,
  Card,
  CardHeader,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  FormControl,
} from '@material-ui/core';
import Link from 'next/link';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import clsx from 'clsx';
// #endregion
// #region Imports Local
import { format } from '../../lib/dayjs';
import Avatar from '../ui/avatar';
import Loading from '../loading';
import { useTranslation } from '../../lib/i18n-client';
import { LARGE_RESOLUTION, TICKET_STATUSES } from '../../lib/constants';
import BaseIcon from '../ui/icon';
import Dropzone from '../dropzone';
import Button from '../ui/button';
import Iframe from '../iframe';
import { ComposeLink } from '../compose-link';
import TicketIconNew from '../../public/images/svg/ticket/ticket_new.svg';
import TicketIconPause from '../../public/images/svg/ticket/ticket_pause.svg';
import TicketIconWorked from '../../public/images/svg/ticket/ticket_worked.svg';
import TicketIconComplete from '../../public/images/svg/ticket/ticket_complete.svg';
import { ProfileTicketInfoCardProps, ProfileTicketComponentProps } from './types';
// #endregion

const getTicketStatusIcon = (status: string): any => {
  switch (status) {
    case TICKET_STATUSES[2]:
    case TICKET_STATUSES[3]:
      return TicketIconPause;
    case TICKET_STATUSES[4]:
      return TicketIconNew;
    case TICKET_STATUSES[1]:
      return TicketIconWorked;
    case TICKET_STATUSES[5]:
      return TicketIconComplete;
    default:
      return TicketIconPause;
  }
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {},
    content: {
      display: 'grid',
      margin: '0 auto',
      gap: `${theme.spacing(4)}px ${theme.spacing(2)}px`,
      width: '100%',
      gridTemplateColumns: '1fr',
      [`@media (min-width:${LARGE_RESOLUTION}px)`]: {
        width: '80%',
      },
      [theme.breakpoints.up('md')]: {
        gridTemplateColumns: '1fr 1fr',
      },
    },
    fullRow: {
      [theme.breakpoints.up('md')]: {
        gridColumnStart: 1,
        gridColumnEnd: 3,
      },
    },
    rounded: {
      borderRadius: theme.spacing(0.5),
    },
    cardHeader: {
      boxShadow: theme.shadows[3],
    },
    lightHeader: {
      padding: theme.spacing(),
    },
    cardContent: {
      'padding': theme.spacing(0, 2),
      '&:first-child': {
        paddingTop: theme.spacing(2),
      },
      '&:last-child': {
        paddingBottom: theme.spacing(2),
      },
    },
    background: {
      background: fade(theme.palette.secondary.main, 0.15),
    },
    cardHeaderTitle: {
      textAlign: 'center',
    },
    notFound: {
      color: '#949494',
    },
    statusBox: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: `${theme.spacing(2)}px`,
      [theme.breakpoints.up('md')]: {
        gridTemplateColumns: '1fr 1fr',
        gap: `${theme.spacing(8)}px`,
      },
    },
    statusContent: {
      'display': 'grid',
      'gridTemplateColumns': '1fr 3fr',
      'gap': `${theme.spacing(4)}px`,
      '&:last-child': {
        paddingBottom: theme.spacing(),
      },
    },
    formControl: {},
    formAction: {
      'display': 'flex',
      'flexDirection': 'row',
      'justifyContent': 'flex-end',
      '& button:not(:last-child)': {
        marginRight: theme.spacing(),
      },
    },
  }),
);

const ProfileTicketInfoCard = withStyles((theme) => ({
  root: {
    borderRadius: theme.spacing(0.5),
    background: fade(theme.palette.secondary.main, 0.15),
  },
  center: {
    textAlign: 'center',
  },
  content: {
    'padding': theme.spacing(0, 2),
    '&:first-child': {
      paddingTop: theme.spacing(2),
    },
    '&:last-child': {
      paddingBottom: theme.spacing(2),
    },
  },
  avatar: {
    height: 90,
    width: 90,
  },
  list: {
    '& > li': {
      display: 'grid',
      gap: `${theme.spacing()}px`,
      gridTemplateColumns: '1fr 2fr',
    },
  },
}))(({ classes, header, profile }: ProfileTicketInfoCardProps) => {
  const { t } = useTranslation();

  return (
    <Card className={classes.root}>
      <CardHeader
        disableTypography
        title={
          <Typography className={classes.center} variant="h6">
            {header}
          </Typography>
        }
      />
      <CardContent className={classes.content}>
        {profile && (
          <Box display="flex">
            <Box mr={2}>
              <Avatar className={classes.avatar} base64={profile.avatar} alt="photo" />
            </Box>
            <Box flex={1}>
              <Paper>
                <List className={classes.list} disablePadding>
                  <ListItem divider>
                    <ListItemText primary={t('phonebook:fields.lastName')} />
                    <ListItemText primary={profile.name} />
                  </ListItem>
                  <ListItem divider>
                    <ListItemText primary={t('phonebook:fields.company')} />
                    <ListItemText primary={profile.company} />
                  </ListItem>
                  <ListItem divider>
                    <ListItemText primary={t('phonebook:fields.department')} />
                    <ListItemText primary={profile.department} />
                  </ListItem>
                  <ListItem divider>
                    <ListItemText primary={t('phonebook:fields.title')} />
                    <ListItemText primary={profile.position} />
                  </ListItem>
                  <ListItem divider>
                    <ListItemText primary={t('phonebook:fields.telephone')} />
                    <ListItemText primary={profile.telephone} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary={t('phonebook:fields.email')} />
                    <ListItemText primary={<ComposeLink to={profile.email}>{profile.email}</ComposeLink>} />
                  </ListItem>
                </List>
              </Paper>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
});

const ProfileTicketComponent: FC<ProfileTicketComponentProps> = ({
  loading,
  loadingEdit,
  ticket,
  comment,
  files,
  setFiles,
  handleComment,
  handleAccept,
  handleClose,
}) => {
  const classes = useStyles({});
  const { t, i18n } = useTranslation();

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" flexGrow={1} flexDirection="column" px={4} py={2} overflow="auto">
        <Box display="flex">
          <Link href={{ pathname: '/profile' }} as="/profile" passHref>
            <IconButton>
              <ArrowBackIcon />
            </IconButton>
          </Link>
        </Box>
        {!ticket ? (
          <Loading activate={loading} full type="circular" color="secondary" disableShrink size={48}>
            <Typography className={clsx(classes.cardHeaderTitle, classes.notFound)} variant="h4">
              {t('profile:notFound')}
            </Typography>
          </Loading>
        ) : (
          <Box className={classes.content}>
            <Card className={classes.fullRow}>
              <CardHeader
                disableTypography
                className={clsx(classes.cardHeader, classes.background)}
                title={
                  <Typography className={classes.cardHeaderTitle} variant="h6">
                    {t('profile:ticket.header', {
                      ticket: ticket.code,
                      date: format(ticket.createdDate, i18n),
                    })}
                  </Typography>
                }
              />
              <CardContent>{ticket.name}</CardContent>
            </Card>
            <ProfileTicketInfoCard header={t('profile:tickets.headers.author')} profile={ticket.initiatorUser} />
            <ProfileTicketInfoCard header={t('profile:tickets.headers.executor')} profile={ticket.executorUser} />
            <Card className={clsx(classes.fullRow, classes.rounded, classes.background)}>
              <CardContent className={classes.cardContent}>
                <Box className={classes.statusBox}>
                  <Card>
                    <CardHeader
                      className={classes.lightHeader}
                      disableTypography
                      title={
                        <Typography className={classes.cardHeaderTitle} variant="subtitle1">
                          {t('profile:tickets.headers.service')}
                        </Typography>
                      }
                    />
                    <CardContent className={clsx(classes.cardContent, classes.statusContent)}>
                      <Box textAlign="center">
                        <BaseIcon base64 src={ticket?.service.avatar} size={48} />
                      </Box>
                      <span>{ticket?.service.name}</span>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader
                      className={classes.lightHeader}
                      disableTypography
                      title={
                        <Typography className={classes.cardHeaderTitle} variant="subtitle1">
                          {t('profile:tickets.headers.status')}
                        </Typography>
                      }
                    />
                    <CardContent className={clsx(classes.cardContent, classes.statusContent)}>
                      <Box textAlign="center">
                        <BaseIcon src={getTicketStatusIcon(ticket.status)} size={48} />
                      </Box>
                      <span>{ticket.status}</span>
                    </CardContent>
                  </Card>
                </Box>
              </CardContent>
            </Card>
            <Card className={classes.fullRow}>
              <CardHeader
                disableTypography
                className={clsx(classes.cardHeader, classes.background)}
                title={
                  <Typography className={classes.cardHeaderTitle} variant="h6">
                    {t('profile:tickets.headers.description')}
                  </Typography>
                }
              />
              <CardContent dangerouslySetInnerHTML={{ __html: ticket.description }} />
            </Card>
            {ticket.files.length > 0 && (
              <Card className={classes.fullRow}>
                <CardHeader
                  disableTypography
                  className={clsx(classes.cardHeader, classes.background)}
                  title={
                    <Typography className={classes.cardHeaderTitle} variant="h6">
                      {t('profile:tickets.headers.files')}
                    </Typography>
                  }
                />
                <CardContent>
                  <Box display="flex" flexDirection="column">
                    {ticket.files.map((file) => (
                      <Typography variant="subtitle1" key={file.code}>
                        {`${file.name}.${file.ext}`}
                      </Typography>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            )}
            <Card className={classes.fullRow}>
              <CardHeader
                disableTypography
                className={clsx(classes.cardHeader, classes.background)}
                title={
                  <Typography className={classes.cardHeaderTitle} variant="h6">
                    {t('profile:tickets.headers.comments')}
                  </Typography>
                }
              />
              <CardContent>
                <Iframe srcDoc={ticket.descriptionFull} />
              </CardContent>
            </Card>
            {ticket.status !== 'Завершен' && (
              <Loading
                activate={loadingEdit}
                full
                wrapperClasses={classes.fullRow}
                type="circular"
                color="secondary"
                disableShrink
                size={48}
              >
                <FormControl className={clsx(classes.fullRow, classes.formControl)} variant="outlined">
                  <TextField
                    value={comment}
                    onChange={handleComment}
                    multiline
                    rows={5}
                    type="text"
                    color="secondary"
                    label={t('profile:tickets.comment.add')}
                    variant="outlined"
                  />
                </FormControl>
                <FormControl className={clsx(classes.fullRow, classes.formControl)} variant="outlined">
                  <Dropzone files={files} setFiles={setFiles} color="secondary" />
                </FormControl>
                <FormControl className={clsx(classes.fullRow, classes.formControl, classes.formAction)}>
                  <Button actionType="cancel" onClick={handleClose}>
                    {t('common:cancel')}
                  </Button>
                  <Button onClick={handleAccept}>{t('common:send')}</Button>
                </FormControl>
              </Loading>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ProfileTicketComponent;
