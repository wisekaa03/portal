/** @format */

// #region Imports NPM
import React, { useContext } from 'react';
import { Theme, useTheme, makeStyles, createStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { List, ListItem, ListItemText, ListItemIcon, Drawer, useMediaQuery } from '@material-ui/core';
import MailIcon from '@material-ui/icons/Mail';
import SettingsIcon from '@material-ui/icons/Settings';
import AssignmentIndIcon from '@material-ui/icons/AssignmentInd';
import ImportContactsIcon from '@material-ui/icons/ImportContacts';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
import DvrIcon from '@material-ui/icons/Dvr';
import LiveHelpIcon from '@material-ui/icons/LiveHelp';
import Link from 'next/link';
import { useRouter } from 'next/router';
// #endregion
// #region Imports Local
import { ProfileContext } from '../lib/types';
import { appBarHeight } from './app-bar';
import DrawerBg from '../public/images/jpeg/drawer_bg.jpg';
import Icon from './icon';
import ItIcon from '../public/images/svg/it-icon.svg';
// #endregion

const drawerWidth = 256;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {},
    toolbar: {
      ...theme.mixins.toolbar,
      [theme.breakpoints.up('md')]: {
        marginTop: appBarHeight,
      },
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
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    drawerClose: {
      overflowX: 'hidden',
      width: theme.spacing(7) + 1,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    item: {
      // paddingLeft: theme.spacing(3),
    },
  }),
);

interface DrawerProps {
  open: boolean;
  handleOpen(): void;
}

export default (props: DrawerProps): React.ReactElement => {
  const classes = useStyles({});
  const theme = useTheme();
  const router = useRouter();
  const profile = useContext(ProfileContext);
  const smDown = useMediaQuery(theme.breakpoints.down('sm'));
  const { open, handleOpen } = props;

  const urls = [
    { text: 'Почта', link: 'https://mail.kngk-group.ru', icon: <MailIcon /> },
    { text: 'Адресная книга', link: '/phonebook', icon: <ImportContactsIcon /> },
    { text: 'Личный кабинет', link: '/', icon: <AssignmentIndIcon /> },
    {
      text: 'Заявка в ИТ',
      link: '/',
      icon: <Icon src={ItIcon} />,
    },
    { text: 'Календарь компании', link: '/', icon: <CalendarTodayIcon /> },
    { text: 'База знаний', link: '/', icon: <LiveHelpIcon /> },
    { text: 'Переговорные', link: '/', icon: <QuestionAnswerIcon /> },
    { text: 'Лента новостей', link: '/', icon: <DvrIcon /> },
    { text: 'Настройки', link: '/', icon: <SettingsIcon /> },
  ];

  // TODO: подумать как правильнее разделять сервер и клиент при определении маршрута
  const pathname = router && 'pathname' in router ? router.pathname : '';

  const drawer = (
    <div className={classes.toolbar}>
      <List>
        {urls.map((url) => (
          <li key={url.text} className={classes.item}>
            {url.link[0] !== '/' ? (
              <ListItem
                button
                selected={url.link === pathname}
                component="a"
                href={url.link}
                target="_blank"
                title={url.text}
              >
                {url.icon ? <ListItemIcon>{url.icon}</ListItemIcon> : null}
                <ListItemText primary={url.text} />
              </ListItem>
            ) : (
              <Link href={url.link} passHref>
                <ListItem button selected={url.link === pathname} component="a" title={url.text}>
                  {url.icon ? <ListItemIcon>{url.icon}</ListItemIcon> : null}
                  <ListItemText primary={url.text} />
                </ListItem>
              </Link>
            )}
          </li>
        ))}
      </List>
    </div>
  );

  return (
    <nav className={classes.root}>
      {(profile && profile.isMobile) || smDown ? (
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
