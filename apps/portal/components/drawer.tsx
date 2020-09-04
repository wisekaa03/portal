/** @format */

//#region Imports NPM
import React, { FC, useContext } from 'react';
import { Theme, useTheme, makeStyles, createStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { List, ListItem, ListItemText, ListItemIcon, Drawer, useMediaQuery, Tooltip } from '@material-ui/core';
import Link from 'next/link';
import { useRouter } from 'next/router';
//#endregion
//#region Imports Local
import { Icon } from '@front/components/ui/icon';
import CalendarIcon from '@images/svg/drawer/calendar.svg'; // ?inline';
import MyTicketsIcon from '@images/svg/drawer/myTickets.svg'; // ?inline';
import TicketsIcon from '@images/svg/drawer/tickets.svg'; // ?inline';
import FaqIcon from '@images/svg/drawer/faq.svg'; // ?inline';
import ProfileIcon from '@images/svg/drawer/profile.svg'; // ?inline';
import MailIcon from '@images/svg/drawer/mail.svg'; // ?inline';
import MediaIcon from '@images/svg/drawer/media.svg'; // ?inline';
import MeetingIcon from '@images/svg/drawer/meeting.svg'; // ?inline';
import VCSIcon from '@images/svg/drawer/vcs.svg'; // ?inline';
import NewsIcon from '@images/svg/drawer/news.svg'; // ?inline';
import PhonebookIcon from '@images/svg/drawer/phonebook.svg'; // ?inline';
import AdminIcon from '@images/svg/drawer/admin.svg'; // ?inline';

import { useTranslation } from '@lib/i18n-client';
import { ProfileContext } from '@lib/context';
import { ADMIN_PAGES } from '@lib/constants';
//#endregion

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
      backgroundColor: '#F5FDFF',
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
      'color': '#3C6AA3',
      '&$itemSelected, &:hover': {
        'color': '#fff',
        '& .MuiIcon-root': {
          background: '#fff',
        },
      },
      '&$itemSelected, &:hover$itemSelected': {
        backgroundColor: '#6AA7C8',
      },
      '&:hover': {
        backgroundColor: 'rgba(106,167,200,0.7)',
      },
    },
    itemSelected: {},
  }),
);

interface DrawerProps {
  open: boolean;
  isMobile?: boolean;
  handleOpen(): void;
}

interface UrlProps {
  icon: any;
  text: string;
  link: string;
  admin: boolean;
}

const urls: UrlProps[] = [
  { icon: MailIcon, text: 'common:mail', link: '/mail', admin: false },
  {
    icon: PhonebookIcon,
    text: 'common:phonebook',
    link: '/phonebook',
    admin: false,
  },
  {
    icon: MyTicketsIcon,
    text: 'common:myTickets',
    link: '/my-tickets',
    admin: false,
  },
  {
    icon: TicketsIcon,
    text: 'common:tickets',
    link: '/tickets',
    admin: false,
  },
  {
    icon: VCSIcon,
    text: 'common:vcs',
    link: `https://vcs.${process.env.DOMAIN}`,
    admin: false,
  },
  { icon: CalendarIcon, text: 'common:calendar', link: '/calendar', admin: false },
  { icon: FaqIcon, text: 'common:faq', link: '/faq', admin: false },
  { icon: MeetingIcon, text: 'common:meeting', link: '/meetings', admin: false },
  { icon: NewsIcon, text: 'common:news', link: '/news', admin: false },
  {
    icon: MediaIcon,
    text: 'common:files',
    link: '/files',
    admin: false,
  },
  { icon: ProfileIcon, text: 'common:profile', link: '/profile', admin: false },
  { icon: AdminIcon, text: 'common:adminPanel', link: '/admin', admin: true },
];

const DrawerComponent: FC<DrawerProps> = ({ open, isMobile, handleOpen }) => {
  const classes = useStyles({});
  const profile = useContext(ProfileContext);
  const { t } = useTranslation();

  const theme = useTheme();
  const smDown = useMediaQuery(theme.breakpoints.down('sm'));

  const { pathname } = useRouter();
  // const pathname = router ? router.pathname : '';

  const drawer = (
    <div className={classes.toolbar}>
      <List>
        {urls
          .filter((url) => !ADMIN_PAGES.includes(url.link) || profile.user?.isAdmin)
          .map((url) => (
            <li key={url.link}>
              {url.link.startsWith('http') ? (
                <Tooltip title={t(url.text) || ''} enterDelay={1000}>
                  <a
                    href={url.link}
                    className="MuiButtonBase-root MuiListItem-root MuiListItem-button"
                    style={{ paddingTop: 0, paddingBottom: 0 }}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <ListItem
                      button
                      selected={pathname.startsWith(url.link)}
                      classes={{
                        root: classes.item,
                        selected: classes.itemSelected,
                      }}
                    >
                      <ListItemIcon>
                        <Icon mask={url.icon} color="secondary" />
                      </ListItemIcon>
                      <ListItemText primary={t(url.text)} />
                    </ListItem>
                  </a>
                </Tooltip>
              ) : (
                <Link href={url.link}>
                  <Tooltip title={t(url.text) || ''} enterDelay={1000}>
                    <ListItem
                      button
                      selected={pathname.startsWith(url.link)}
                      classes={{
                        root: classes.item,
                        selected: classes.itemSelected,
                      }}
                      component="a"
                      target={url.link.startsWith('http') ? '_blank' : undefined}
                    >
                      <ListItemIcon>
                        <Icon mask={url.icon} color="secondary" />
                      </ListItemIcon>
                      <ListItemText primary={t(url.text)} />
                    </ListItem>
                  </Tooltip>
                </Link>
              )}
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

export default DrawerComponent;
