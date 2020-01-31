/** @format */

// #region Imports NPM
import React, { useRef, useContext, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Theme, fade, makeStyles, createStyles } from '@material-ui/core/styles';
import {
  Box,
  Button,
  InputBase,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Divider,
  Checkbox,
  FormControlLabel,
  BoxProps,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { useQuery } from '@apollo/react-hooks';
import clsx from 'clsx';
// #endregion
// #region Imports Local
import { OldTicket } from '@app/portal/ticket/old-service/models/old-service.interface';
import { OLD_TICKETS } from '../../lib/queries';
import BaseIcon from '../../components/icon';
import Page from '../../layouts/main';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '../../lib/i18n-client';
import useDebounce from '../../lib/debounce';
import { ProfileContext } from '../../lib/context';
import dayjs from '../../lib/dayjs';
import { Avatar } from '../../components/avatar';
import { Loading } from '../../components/loading';
// #endregion

const BoxWithRef = Box as React.ComponentType<{ ref: React.Ref<any> } & BoxProps>;

const avatarHeight = 180;
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
    ticketWorked: {
      color: '#3aad0b',
    },
  }),
);

const MyProfile: I18nPage = ({ t, ...rest }): React.ReactElement => {
  const classes = useStyles({});
  const profile = useContext(ProfileContext);
  const [_search, setSearch] = useState<string>('');
  const [status, setStatus] = useState<boolean>(true);
  const search = useDebounce(_search, 300);

  const { loading, data, error } = useQuery(OLD_TICKETS, {
    ssr: false,
    pollInterval: 120000,
    variables: { status: status ? 'В работе' : '' },
  });

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setSearch(event.target.value);
  };

  const handleToggleStatus = (): void => {
    setStatus(!status);
  };

  const ticketBox = useRef(null);

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
                <Avatar fullSize className={classes.avatar} profile={profile.user.profile} alt="photo" />
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
            <Box display="flex" flexDirection="column" flexGrow={1} px={2}>
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
                  <FormControlLabel
                    control={
                      <Checkbox checked={status} onChange={handleToggleStatus} value="status" color="secondary" />
                    }
                    color="red"
                    label={t('profile:tickets.inWork')}
                  />
                </Box>
              </Box>
              <BoxWithRef
                ref={ticketBox}
                overflow="auto"
                style={{
                  maxHeight: ticketBox && ticketBox.current ? `calc(100vh - ${ticketBox.current.offsetTop}px)` : '100%',
                }}
                display="flex"
                flexGrow={1}
                flexWrap="wrap"
                my={2}
                justifyContent="center"
              >
                {loading ? (
                  <Loading full type="circular" color="secondary" disableShrink size={48} />
                ) : (
                  data &&
                  data.OldTickets &&
                  data.OldTickets.map((ticket: OldTicket) => (
                    <Card className={classes.ticket} key={ticket.code}>
                      <CardActionArea>
                        <Link href={{ pathname: '/profile/ticket', query: { id: ticket.code, type: ticket.type } }}>
                          <CardContent className={classes.ticketContent}>
                            <div className={classes.ticketLabel}>
                              <div>
                                <BaseIcon base64 src={ticket.avatar} size={36} />
                              </div>
                              <div>
                                <Typography variant="subtitle2" noWrap>
                                  {ticket.name}
                                </Typography>
                              </div>
                              <div>
                                {/* <Typography
                                  variant="body1"
                                  // eslint-disable-next-line react/no-danger
                                  dangerouslySetInnerHTML={{ __html: ticket.description }}
                                /> */}
                              </div>
                            </div>
                            <Divider />
                            <div className={classes.ticketInformation}>
                              <span>
                                {t('profile:tickets.status')}:{' '}
                                <span
                                  className={clsx({
                                    [classes.ticketRegistered]: ticket.status !== 'В работе',
                                    [classes.ticketWorked]: ticket.status === 'В работе',
                                  })}
                                >
                                  {ticket.status}
                                </span>
                              </span>
                              <span>
                                {t('profile:tickets.date')}: {dayjs(ticket.createdDate).format(DATE_FORMAT)}
                              </span>
                              <span>
                                {t('profile:tickets.id')}: {ticket.code}
                              </span>
                            </div>
                          </CardContent>
                        </Link>
                      </CardActionArea>
                    </Card>
                  ))
                )}
              </BoxWithRef>
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
