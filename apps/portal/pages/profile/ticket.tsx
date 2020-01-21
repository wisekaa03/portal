/** @format */

// #region Imports NPM
import React, { useContext, useState } from 'react';
import Head from 'next/head';
import { fade, Theme, makeStyles, createStyles } from '@material-ui/core/styles';
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
import { useRouter } from 'next/router';
import Link from 'next/link';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import uuidv4 from 'uuid/v4';
import clsx from 'clsx';
import { TFunction } from 'i18next';
// #endregion
// #region Imports Local
import { UserContext } from '@app/portal/user/models/user.dto';
import Page from '../../layouts/main';
import { Avatar } from '../../components/avatar';
import { Loading } from '../../components/loading';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '../../lib/i18n-client';
import { ProfileContext } from '../../lib/context';
import { PROFILE } from '../../lib/queries';
import { LARGE_RESOLUTION } from '../../lib/constants';
import AppIcon from '../../public/images/svg/itapps/app_1.svg';
import BaseIcon from '../../components/icon';
import Dropzone from '../../components/dropzone';
import Button from '../../components/button';
import { DropzoneFile } from '../../components/dropzone/types';
// #endregion

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
      borderRadius: theme.spacing() / 2,
    },
    cardHeader: {
      boxShadow: theme.shadows[3],
    },
    lightHeader: {
      padding: theme.spacing(),
    },
    cardContent: {
      'padding': `0 ${theme.spacing(2)}px`,
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

interface InfoCardProps {
  classes: any;
  header: string;
  profile: UserContext;
  t: TFunction;
}

const InfoCard = ({ classes, header, profile, t }: InfoCardProps): React.ReactElement => (
  <Card className={clsx(classes.rounded, classes.background)}>
    <CardHeader
      disableTypography
      title={
        <Typography className={classes.cardHeaderTitle} variant="h6">
          {header}
        </Typography>
      }
    />
    <CardContent className={classes.cardContent}>
      <Box display="flex">
        <Box mr={2}>
          <Avatar fullSize className={classes.avatar} profile={profile.user.profile} alt="photo" />
        </Box>
        <Box flex={1}>
          <Paper>
            <List className={classes.list} disablePadding>
              <ListItem divider>
                <ListItemText primary={t('phonebook:fields.lastName')} />
                <ListItemText primary="Иванов Иван Иванович" />
              </ListItem>
              <ListItem divider>
                <ListItemText primary={t('phonebook:fields.company')} />
                <ListItemText primary="" />
              </ListItem>
              <ListItem divider>
                <ListItemText primary={t('phonebook:fields.title')} />
                <ListItemText primary="" />
              </ListItem>
              <ListItem divider>
                <ListItemText primary={t('phonebook:fields.telephone')} />
                <ListItemText primary="" />
              </ListItem>
              <ListItem>
                <ListItemText primary={t('phonebook:fields.email')} />
                <ListItemText primary="" />
              </ListItem>
            </List>
          </Paper>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const ProfileTicket: I18nPage = ({ t, ...rest }): React.ReactElement => {
  const classes = useStyles({});
  const [files, setFiles] = useState<DropzoneFile[]>([]);
  const [comment, setComment] = useState<string>('');
  const profile = useContext(ProfileContext);
  const router = useRouter();

  const ticketId = router && router.query && router.query.id;

  const handleComment = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setComment(event.target.value);
  };

  const handleAccept = (): void => {};

  const handleClose = (): void => {
    setComment('');
    setFiles([]);
  };

  return (
    <>
      <Head>
        <title>{t('profile:title')}</title>
      </Head>
      <Page {...rest}>
        <Box display="flex" flexDirection="column">
          {!(profile && profile.user && ticketId) && <Loading noMargin type="linear" variant="indeterminate" />}
          <Box display="flex" flexDirection="column" px={4} py={2} overflow="auto">
            <Box display="flex">
              <Link href={{ pathname: '/profile' }} passHref>
                <IconButton>
                  <ArrowBackIcon />
                </IconButton>
              </Link>
            </Box>
            <Box className={classes.content}>
              <Card className={classes.fullRow}>
                <CardHeader
                  disableTypography
                  className={clsx(classes.cardHeader, classes.background)}
                  title={
                    <Typography className={classes.cardHeaderTitle} variant="h6">
                      ЗАЯВКА № ОТ ДАТА ВРЕМЯ
                    </Typography>
                  }
                />
                <CardContent>ТЕМА</CardContent>
              </Card>
              <InfoCard classes={classes} header={t('profile:tickets.headers.author')} profile={profile} t={t} />
              <InfoCard classes={classes} header={t('profile:tickets.headers.executor')} profile={profile} t={t} />
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
                          <BaseIcon src={AppIcon} size={48} />
                        </Box>
                        <span>Дизайн и полиграфия</span>
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
                          <BaseIcon src={AppIcon} size={48} />
                        </Box>
                        <span>ЗАРЕГИСТРИРОВАН</span>
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
                <CardContent>Ф.И.О.</CardContent>
              </Card>
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
                <CardContent>ФАЙЛЫ</CardContent>
              </Card>
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
                <CardContent>КОММЕНТАРИИ</CardContent>
              </Card>
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
                <Dropzone color="secondary" setFiles={setFiles} files={files} {...rest} />
              </FormControl>
              <FormControl className={clsx(classes.fullRow, classes.formControl, classes.formAction)}>
                <Button actionType="cancel" onClick={handleClose}>
                  {t('common:cancel')}
                </Button>
                <Button onClick={handleAccept}>{t('profile:tickets.comment.submit')}</Button>
              </FormControl>
            </Box>
          </Box>
        </Box>
      </Page>
    </>
  );
};

ProfileTicket.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['profile', 'phonebook']),
});

export default nextI18next.withTranslation('profile')(ProfileTicket);
