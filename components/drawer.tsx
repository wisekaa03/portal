/** @format */

// #region Imports NPM
import React from 'react';
import { Theme, useTheme, makeStyles, createStyles } from '@material-ui/core/styles';
import { Divider, List, ListItem, ListItemText, Hidden, Drawer /* , useMediaQuery */ } from '@material-ui/core';
// import MenuIcon from '@material-ui/icons/Menu';
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
      paddingLeft: '60px',
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
    { text: 'Адресная книга', link: '/phonebook' },
    { text: 'Почта', link: '/' },
    { text: 'Создать заявку', link: '/' },
    { text: 'Календарь компании', link: '/' },
    { text: 'База знаний', link: '/' },
    { text: 'Переговорные', link: '/' },
    { text: 'Сайты', link: '/' },
    { text: 'Настройки', link: '/' },
  ];

  const drawer = (
    <div className={classes.toolbar}>
      <List>
        {urls.map((url) => (
          <li key={url.text} className={classes.item}>
            <Link href={url.link} passHref>
              <ListItem button component="a">
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
