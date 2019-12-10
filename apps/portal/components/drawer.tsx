/** @format */

// #region Imports NPM
import React, { useContext } from 'react';
import { Theme, useTheme, makeStyles, createStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { List, ListItem, ListItemText, ListItemIcon, Drawer, useMediaQuery } from '@material-ui/core';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { WithTranslation } from 'next-i18next';
// #endregion
// #region Imports Local
import { I18nPage, nextI18next, includeDefaultNamespaces } from '../lib/i18n-client';
import DrawerBg from '../../../public/images/jpeg/drawer_bg.jpg';
import Icon from './icon';
import CalendarIcon from '../../../public/images/svg/icons/calendar.svg';
import CalendarIconSelected from '../../../public/images/svg/icons/calendar_select.svg';
import ServicesIcon from '../../../public/images/svg/icons/services.svg';
import ServicesIconSelected from '../../../public/images/svg/icons/services_select.svg';
import FaqIcon from '../../../public/images/svg/icons/faq.svg';
import FaqIconSelected from '../../../public/images/svg/icons/faq_select.svg';
import ProfileIcon from '../../../public/images/svg/icons/profile.svg';
import ProfileIconSelected from '../../../public/images/svg/icons/profile_select.svg';
import MailIcon from '../../../public/images/svg/icons/mail.svg';
import MailIconSelected from '../../../public/images/svg/icons/mail_select.svg';
import MeetingIcon from '../../../public/images/svg/icons/meeting.svg';
import MeetingIconSelected from '../../../public/images/svg/icons/meeting_select.svg';
import NewsIcon from '../../../public/images/svg/icons/news.svg';
import NewsIconSelected from '../../../public/images/svg/icons/news_select.svg';
import PhonebookIcon from '../../../public/images/svg/icons/phonebook.svg';
import PhonebookIconSelected from '../../../public/images/svg/icons/phonebook_select.svg';
import SettingsIcon from '../../../public/images/svg/icons/settings.svg';
import SettingsIconSelected from '../../../public/images/svg/icons/settings_select.svg';
import AdminIcon from '../../../public/images/svg/icons/admin.svg';
import AdminIconSelected from '../../../public/images/svg/icons/admin_select.svg';
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
      '&:hover:not($itemSelected)': {
        backgroundColor: '#5F9898aa',
        color: '#fff',
      },
    },
    itemSelected: {
      backgroundColor: '#5F9898!important',
      color: '#fff',
    },
  }),
);

interface DrawerProps extends WithTranslation {
  open: boolean;
  isMobile?: boolean;
  handleOpen(): void;
}

interface UrlProps {
  icon: any;
  selected: any;
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
    { icon: MailIcon, selected: MailIconSelected, text: t('common:mail'), link: '/mail', admin: false },
    {
      icon: PhonebookIcon,
      selected: PhonebookIconSelected,
      text: t('common:phonebook'),
      link: '/phonebook',
      admin: false,
    },
    { icon: ProfileIcon, selected: ProfileIconSelected, text: t('common:profile'), link: '/profile', admin: false },
    {
      icon: ServicesIcon,
      selected: ServicesIconSelected,
      text: t('common:services'),
      link: '/services',
      admin: false,
    },
    { icon: CalendarIcon, selected: CalendarIconSelected, text: t('common:calendar'), link: '/calendar', admin: false },
    { icon: FaqIcon, selected: FaqIconSelected, text: t('common:faq'), link: '/faq', admin: false },
    { icon: MeetingIcon, selected: MeetingIconSelected, text: t('common:meeting'), link: '/meetings', admin: false },
    { icon: NewsIcon, selected: NewsIconSelected, text: t('common:news'), link: '/news', admin: false },
    { icon: SettingsIcon, selected: SettingsIconSelected, text: t('common:settings'), link: '/settings', admin: false },
    { icon: AdminIcon, selected: AdminIconSelected, text: t('common:adminPanel'), link: '/admin', admin: true },
  ];

  const pathname = router ? router.pathname : '';

  const drawer = (
    <div className={classes.toolbar}>
      <List>
        {urls.reduce((result: JSX.Element[], url: UrlProps) => {
          if (ADMIN_PAGES.includes(url.link) && (!profile.user || (profile.user && !profile.user.isAdmin))) {
            return result;
          }

          const selected = pathname.startsWith(url.link);

          const handleEnter = (e: any): void => {
            if (selected) return;

            e.currentTarget.firstElementChild.firstElementChild.firstElementChild.src = url.selected;
          };

          const handleLeave = (e: any): void => {
            if (selected) return;

            e.currentTarget.firstElementChild.firstElementChild.firstElementChild.src = url.icon;
          };

          return [
            ...result,
            <li key={url.text}>
              <Link href={url.link} passHref>
                <ListItem
                  button
                  onMouseOver={handleEnter}
                  onMouseOut={handleLeave}
                  onFocus={handleEnter}
                  onBlur={handleLeave}
                  selected={selected}
                  className={clsx(classes.item, {
                    [classes.itemSelected]: selected,
                  })}
                  component="a"
                  title={url.text}
                >
                  <ListItemIcon>
                    <Icon src={selected ? url.selected : url.icon} />
                  </ListItemIcon>
                  <ListItemText primary={url.text} />
                </ListItem>
              </Link>
            </li>,
          ];
        }, [])}
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
          className={clsx(classes.drawer, {
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open,
          })}
          classes={{
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
          className={clsx(classes.drawer, {
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open,
          })}
          classes={{
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

export default nextI18next.withTranslation('common')(BaseDrawer);
