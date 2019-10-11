/** @format */

// #region Imports NPM
import React from 'react';
import { Theme, useTheme, makeStyles, createStyles } from '@material-ui/core/styles';
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Hidden,
  Drawer /* , useMediaQuery */,
} from '@material-ui/core';
import MailOutlineIcon from '@material-ui/icons/MailOutline';
import SettingsIcon from '@material-ui/icons/Settings';
import ImportContactsIcon from '@material-ui/icons/ImportContacts';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
import LaptopMacIcon from '@material-ui/icons/LaptopMac';
import Link from 'next/link';
// #endregion
// #region Imports Local
import { appBarHeight } from './app-bar';
// #endregion

export const drawerWidth = 256;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    toolbar: {
      ...theme.mixins.toolbar,
      [theme.breakpoints.up('md')]: {
        marginTop: appBarHeight,
      },
    },
    drawer: {
      [theme.breakpoints.up('md')]: {
        width: drawerWidth,
        flexShrink: 0,
      },
    },
    drawerPaper: {
      width: drawerWidth,
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
  // TODO: продумать как узнать устройство на серверной стороне
  // const mdUp = useMediaQuery(theme.breakpoints.up('md'));
  const { open, handleOpen } = props;

  const urls = [
    { text: 'Адресная книга', link: '/phonebook', icon: <ImportContactsIcon /> },
    { text: 'Почта', link: '/', icon: <MailOutlineIcon /> },
    { text: 'Создать заявку', link: '/', icon: <HelpOutlineIcon /> },
    { text: 'Календарь компании', link: '/', icon: <CalendarTodayIcon /> },
    { text: 'База знаний', link: '/', icon: <QuestionAnswerIcon /> },
    { text: 'Переговорные', link: '/', icon: <HelpOutlineIcon /> },
    { text: 'Сайты', link: '/', icon: <LaptopMacIcon /> },
    { text: 'Настройки', link: '/', icon: <SettingsIcon /> },
  ];

  const drawer = (
    <div className={classes.toolbar}>
      <List>
        {urls.map((url) => (
          <li key={url.text} className={classes.item}>
            <Link href={url.link} passHref>
              <ListItem button component="a">
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
    <nav className={classes.drawer}>
      <Hidden mdUp implementation="css">
        <Drawer
          variant="temporary"
          anchor={theme.direction === 'rtl' ? 'right' : 'left'}
          open={open}
          onClose={handleOpen}
          classes={{
            paper: classes.drawerPaper,
          }}
          ModalProps={{ keepMounted: true }}
        >
          {drawer}
        </Drawer>
      </Hidden>
      <Hidden smDown implementation="css">
        <Drawer
          variant="permanent"
          open
          classes={{
            paper: classes.drawerPaper,
          }}
        >
          {drawer}
        </Drawer>
      </Hidden>
    </nav>
  );
};
