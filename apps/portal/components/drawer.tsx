/** @format */

// #region Imports NPM
import React, { useContext } from 'react';
import { fade, Theme, useTheme, makeStyles, createStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { List, ListItem, ListItemText, ListItemIcon, Drawer, useMediaQuery } from '@material-ui/core';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { WithTranslation } from 'next-i18next';
// #endregion
// #region Imports Local
import { I18nPage, nextI18next, includeDefaultNamespaces } from '../lib/i18n-client';
import DrawerBg from '../../../public/images/jpeg/drawer_bg.jpg';
import Icon from './ui/icon';
import CalendarIcon from '../../../public/images/svg/icons/calendar.svg';
import ServicesIcon from '../../../public/images/svg/icons/services.svg';
import FaqIcon from '../../../public/images/svg/icons/faq.svg';
import ProfileIcon from '../../../public/images/svg/icons/profile.svg';
import MailIcon from '../../../public/images/svg/icons/mail.svg';
import MediaIcon from '../../../public/images/svg/icons/media.svg';
import MeetingIcon from '../../../public/images/svg/icons/meeting.svg';
import NewsIcon from '../../../public/images/svg/icons/news.svg';
import PhonebookIcon from '../../../public/images/svg/icons/phonebook.svg';
import SettingsIcon from '../../../public/images/svg/icons/settings.svg';
import AdminIcon from '../../../public/images/svg/icons/admin.svg';
import { ProfileContext } from '../lib/context';
import { ADMIN_PAGES } from '../lib/constants';
// #endregion

const drawerWidth = 256;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    toolbar: {
      ...theme.mixins.toolbar,
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
      whiteSpace: 'nowrap',
    },
    paper: {
      background: `url(${DrawerBg})`,
    },
    drawerOpen: {
      width: drawerWidth,
      position: 'relative',
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    drawerClose: {
      overflowX: 'hidden',
      width: theme.spacing(7) + 1,
      position: 'relative',
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    item: {
      '&$itemSelected, &:hover': {
        'color': '#fff',
        '& .MuiIcon-root': {
          background: '#fff',
        },
      },
      '&$itemSelected, &:hover$itemSelected': {
        backgroundColor: theme.palette.secondary.main,
      },
      '&:hover': {
        backgroundColor: fade(theme.palette.secondary.main, 0.75),
      },
    },
    itemSelected: {},
  }),
);

interface DrawerProps extends WithTranslation {
  open: boolean;
  isMobile?: boolean;
  handleOpen(): void;
}

interface UrlProps {
  icon: any;
  text: any;
  link: string;
  admin: boolean;
}

const BaseDrawer: I18nPage<DrawerProps> = (props): React.ReactElement => {
  const classes = useStyles({});
  const theme = useTheme();
  const router = useRouter();
  const smDown = useMediaQuery(theme.breakpoints.down('sm'));
  const profile = useContext(ProfileContext);
  const { open, isMobile, handleOpen, t } = props;

  const urls: UrlProps[] = [
    { icon: MailIcon, text: t('common:mail'), link: '/mail', admin: false },
    {
      icon: PhonebookIcon,
      text: t('common:phonebook'),
      link: '/phonebook',
      admin: false,
    },
    { icon: ProfileIcon, text: t('common:profile'), link: '/profile', admin: false },
    {
      icon: ServicesIcon,
      text: t('common:services'),
      link: '/services',
      admin: false,
    },
    { icon: CalendarIcon, text: t('common:calendar'), link: '/calendar', admin: false },
    { icon: FaqIcon, text: t('common:faq'), link: '/faq', admin: false },
    { icon: MeetingIcon, text: t('common:meeting'), link: '/meetings', admin: false },
    { icon: NewsIcon, text: t('common:news'), link: '/news', admin: false },
    {
      icon: MediaIcon,
      text: t('common:media'),
      link: '/media',
      admin: false,
    },
    { icon: SettingsIcon, text: t('common:settings'), link: '/settings', admin: false },
    { icon: AdminIcon, text: t('common:adminPanel'), link: '/admin', admin: true },
  ];

  const pathname = router ? router.pathname : '';

  const drawer = (
    <div className={classes.toolbar}>
      <List>
        {urls
          .filter((url) => !ADMIN_PAGES.includes(url.link) || profile.user?.isAdmin)
          .map((url) => (
            <li key={url.text}>
              <Link href={url.link} passHref>
                <ListItem
                  button
                  selected={pathname.startsWith(url.link)}
                  classes={{
                    root: classes.item,
                    selected: classes.itemSelected,
                  }}
                  component="a"
                  title={url.text}
                >
                  <ListItemIcon>
                    <Icon mask={url.icon} color="secondary" />
                  </ListItemIcon>
                  <ListItemText primary={url.text} />
                </ListItem>
              </Link>
            </li>
          ))}
      </List>
    </div>
  );

  return (
    <nav className={classes.root}>
      {isMobile || smDown ? (
        <Drawer
          variant="temporary"
          anchor={theme.direction === 'rtl' ? 'right' : 'left'}
          open={open}
          onClose={handleOpen}
          classes={{
            root: clsx(classes.drawer, {
              [classes.drawerOpen]: open,
              [classes.drawerClose]: !open,
            }),
            paper: clsx(classes.paper, {
              [classes.drawerOpen]: open,
              [classes.drawerClose]: !open,
            }),
          }}
          ModalProps={{ keepMounted: true }}
        >
          {drawer}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          open={open}
          classes={{
            root: clsx(classes.drawer, {
              [classes.drawerOpen]: open,
              [classes.drawerClose]: !open,
            }),
            paper: clsx(classes.paper, {
              [classes.drawerOpen]: open,
              [classes.drawerClose]: !open,
            }),
          }}
        >
          {drawer}
        </Drawer>
      )}
    </nav>
  );
};

BaseDrawer.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['common']),
});

export default React.memo(nextI18next.withTranslation('common')(BaseDrawer));
