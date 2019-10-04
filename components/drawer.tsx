/** @format */

import React from 'react';
import { Theme, useTheme, makeStyles, createStyles } from '@material-ui/core/styles';
import { Divider, List, ListItem, ListItemText, Hidden, Drawer } from '@material-ui/core';
// import MenuIcon from '@material-ui/icons/Menu';
// import Link from 'next/link';

import { appBarHeight } from './app-bar';

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
      paddingLeft: '80px',
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
  const { open, handleOpen } = props;

  const drawer = (
    <div className={classes.toolbar}>
      <List>
        {[
          'Адресная книга',
          'Почта',
          'Создать заявку',
          'Календарь компании',
          'База знаний',
          'Переговорные',
          'Сайты',
          'Настройки',
        ].map((text) => (
          <ListItem button key={text} className={classes.item}>
            <ListItemText primary={text} />
          </ListItem>
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
