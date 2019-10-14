/** @format */

// #region Imports NPM
import React from 'react';
import { Theme, useTheme, makeStyles, createStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { Divider, List, ListItem, ListItemText, ListItemIcon, Hidden, Drawer, useMediaQuery } from '@material-ui/core';
import MailIcon from '@material-ui/icons/Mail';
import SettingsIcon from '@material-ui/icons/Settings';
import AssignmentIndIcon from '@material-ui/icons/AssignmentInd';
import ImportContactsIcon from '@material-ui/icons/ImportContacts';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
import DvrIcon from '@material-ui/icons/Dvr';
import LiveHelpIcon from '@material-ui/icons/LiveHelp';
import Link from 'next/link';
import { useRouter } from 'next/router';
// #endregion
// #region Imports Local
import { appBarHeight } from './app-bar';

// #endregion

export const drawerWidth = 256;

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
      // [theme.breakpoints.up('md')]: {
      width: drawerWidth,
      flexShrink: 0,
      whiteSpace: 'nowrap',
      // },
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
  const { pathname = null } = useRouter();
  // TODO: продумать как узнать устройство на серверной стороне
  const smDown = useMediaQuery(theme.breakpoints.down('sm'));
  const { open, handleOpen } = props;

  const urls = [
    { text: 'Почта', link: '/', icon: <MailIcon /> },
    { text: 'Адресная книга', link: '/phonebook', icon: <ImportContactsIcon /> },
    { text: 'Личный кабинет', link: '/', icon: <AssignmentIndIcon /> },
    { text: 'Заявка в ИТ', link: '/', icon: <HelpOutlineIcon /> },
    { text: 'Календарь компании', link: '/', icon: <CalendarTodayIcon /> },
    { text: 'База знаний', link: '/', icon: <LiveHelpIcon /> },
    { text: 'Переговорные', link: '/', icon: <QuestionAnswerIcon /> },
    { text: 'Лента новостей', link: '/', icon: <DvrIcon /> },
    { text: 'Настройки', link: '/', icon: <SettingsIcon /> },
  ];

  const drawer = (
    <div className={classes.toolbar}>
      <List>
        {urls.map((url) => (
          <li key={url.text} className={classes.item}>
            <Link href={url.link} passHref>
              <ListItem button selected={url.link === pathname} component="a" title={url.text}>
                {url.icon ? <ListItemIcon>{url.icon}</ListItemIcon> : null}
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
      <Hidden mdUp implementation="css">
        <Drawer
          variant="temporary"
          anchor={theme.direction === 'rtl' ? 'right' : 'left'}
          open={smDown && open}
          onClose={handleOpen}
          className={clsx(classes.drawer, {
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open,
          })}
          classes={{
            paper: clsx({
              [classes.drawerOpen]: open,
              [classes.drawerClose]: !open,
            }),
          }}
          ModalProps={{ keepMounted: true }}
        >
          {drawer}
        </Drawer>
      </Hidden>
      <Hidden smDown implementation="css">
        <Drawer
          variant="permanent"
          open={open}
          className={clsx(classes.drawer, {
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open,
          })}
          classes={{
            paper: clsx({
              [classes.drawerOpen]: open,
              [classes.drawerClose]: !open,
            }),
          }}
        >
          {drawer}
        </Drawer>
      </Hidden>
    </nav>
  );
};
