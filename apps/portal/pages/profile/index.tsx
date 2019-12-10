/** @format */

// #region Imports NPM
import React, { useContext, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Theme, fade, makeStyles, createStyles } from '@material-ui/core/styles';
import {
  Box,
  Button,
  Container,
  InputBase,
  IconButton,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Divider,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import FilterListIcon from '@material-ui/icons/FilterList';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import clsx from 'clsx';
// #endregion
// #region Imports Local
import BaseIcon from '../../components/icon';
import Page from '../../layouts/main';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '../../lib/i18n-client';
import useDebounce from '../../lib/debounce';
import { ProfileContext } from '../../lib/context';
import dayjs from '../../lib/dayjs';
import { Avatar } from '../../components/avatar';
import AppIcon1 from '../../../../public/images/svg/itapps/app_1.svg';
// #endregion

const avatarHeight = 180;
const cardWidth = 300;
const DATE_FORMAT = 'DD.MM.YYYY г.';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    avatar: {
      width: avatarHeight,
      height: avatarHeight,
      borderRadius: theme.spacing() / 2,
    },
    personal: {
      flex: 1,
      background: fade(theme.palette.secondary.main, 0.15),
      padding: theme.spacing(),
      color: theme.palette.secondary.main,
      borderRadius: theme.spacing() / 2,
      marginBottom: theme.spacing(),
    },
    links: {
      'display': 'grid',
      'gridGap': theme.spacing(),
      'gridAutoColumns': 180,
      'gridAutoRows': '1fr',
      '& > a': {
        borderRadius: theme.spacing() / 2,
        lineHeight: '1.2em',
        textAlign: 'center',
      },
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
    search: {
      'position': 'relative',
      'backgroundColor': fade(theme.palette.common.white, 0.15),
      'width': '100%',
      'borderRadius': theme.spacing() / 2,
      'border': `1px solid ${theme.palette.secondary.main}`,
      '&:hover': {
        backgroundColor: fade(theme.palette.common.white, 0.25),
      },
      [theme.breakpoints.up('sm')]: {
        width: 'auto',
      },
    },
    searchIcon: {
      width: theme.spacing(7),
      height: '100%',
      position: 'absolute',
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: theme.palette.secondary.main,
    },
    inputInput: {
      padding: theme.spacing(1, 1, 1, 7),
      transition: theme.transitions.create('width'),
      width: '100%',
      color: theme.palette.secondary.main,
      [theme.breakpoints.up('sm')]: {
        width: 200,
      },
    },
    iconButton: {
      padding: theme.spacing() / 2,
      color: theme.palette.secondary.main,
    },
    headerButtons: {
      minWidth: 260,
    },
    ticket: {
      display: 'flex',
      flex: 1,
      height: 200,
      minWidth: 300,
      maxWidth: 300,
      borderRadius: theme.spacing() / 2,
      background: fade(theme.palette.secondary.main, 0.15),
      marginRight: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
    ticketContent: {
      'padding': theme.spacing(2),
      '& > hr': {
        marginTop: theme.spacing(),
        marginBottom: theme.spacing(),
      },
    },
    ticketLabel: {
      'display': 'grid',
      'gridTemplateColumns': '1fr 4fr',
      'gridTemplateRows': '40px 60px',
      'gridGap': theme.spacing(),
      '& h6': {
        maxWidth: 220,
      },
      '& > div:last-child': {
        gridColumnStart: 1,
        gridColumnEnd: 3,
      },
    },
    ticketInformation: {
      display: 'flex',
      flexDirection: 'column',
      color: 'gray',
    },
    ticketRegistered: {
      color: '#b99d15',
    },
  }),
);

const MyProfile: I18nPage = ({ t, ...rest }): React.ReactElement => {
  const classes = useStyles({});
  const profile = useContext(ProfileContext);
  const [_search, setSearch] = useState<string>('');
  const search = useDebounce(_search, 300);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setSearch(event.target.value);
  };

  return (
    <>
      <Head>
        <title>{t('profile:title')}</title>
      </Head>
      <Page {...rest}>
        {profile && profile.user && (
          <Box display="flex" flexDirection="column" p={1}>
            <Box display="flex" flexWrap="wrap">
              <Box mr={1} mb={1}>
                <Avatar fullSize className={classes.avatar} profile={profile.user.profile} />
              </Box>
              <div className={classes.personal}>
                <Box display="flex" flexDirection="column" mb={1}>
                  {profile.user.profile.lastName && <span>{profile.user.profile.lastName}</span>}
                  {profile.user.profile.firstName && <span>{profile.user.profile.firstName}</span>}
                  {profile.user.profile.middleName && <span>{profile.user.profile.middleName}</span>}
                </Box>
                <div className={classes.links}>
                  <Link href={{ pathname: '/profile/edit' }} passHref>
                    <Button color="secondary" component="a" variant="contained">
                      {t('profile:btnEdit')}
                    </Button>
                  </Link>
                  <Link href={{ pathname: '/profile/equipment' }} passHref>
                    <Button color="secondary" component="a" variant="contained">
                      {t('profile:btnEquipment')}
                    </Button>
                  </Link>
                </div>
              </div>
            </Box>
            <Box className={classes.container}>
              <Box display="flex" mb={1}>
                <div className={classes.search}>
                  <div className={classes.searchIcon}>
                    <SearchIcon />
                  </div>
                  <InputBase
                    onChange={handleSearch}
                    placeholder={t('profile:searchPlaceholder')}
                    classes={{
                      input: classes.inputInput,
                    }}
                    inputProps={{ 'aria-label': 'search' }}
                  />
                </div>
                <Box display="flex" justifyContent="center" alignItems="center" flexGrow={1} px={1}>
                  <Typography color="secondary" variant="h4">
                    {t('profile:tickets.title')}
                  </Typography>
                </Box>
                <Box display="flex" className={classes.headerButtons} justifyContent="flex-end">
                  <IconButton className={classes.iconButton}>
                    <FilterListIcon />
                  </IconButton>
                  <IconButton className={classes.iconButton}>
                    <HelpOutlineIcon />
                  </IconButton>
                </Box>
              </Box>
              <Box display="flex" flexGrow={1} flexWrap="wrap">
                <Card className={classes.ticket}>
                  <CardActionArea>
                    <CardContent className={classes.ticketContent}>
                      <div className={classes.ticketLabel}>
                        <div>
                          <BaseIcon src={AppIcon1} size={36} />
                        </div>
                        <div>
                          <Typography variant="subtitle2" noWrap>
                            Печать и сканирование
                          </Typography>
                        </div>
                        <div>
                          <Typography variant="body1">Заменить картридж в принтере на 7 этаже</Typography>
                        </div>
                      </div>
                      <Divider />
                      <div className={classes.ticketInformation}>
                        <span>
                          {t('profile:tickets.status')}:{' '}
                          <span
                            className={clsx({
                              [classes.ticketRegistered]: true,
                            })}
                          >
                            Зарегистрирована
                          </span>
                        </span>
                        <span>
                          {t('profile:tickets.date')}: {dayjs(new Date()).format(DATE_FORMAT)}
                        </span>
                        <span>{t('profile:tickets.id')}: 14234234</span>
                      </div>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Box>
            </Box>
          </Box>
        )}
      </Page>
    </>
  );
};

MyProfile.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['profile']),
});

export default nextI18next.withTranslation('profile')(MyProfile);
