/** @format */

// #region Imports NPM
import React /* , { useState, useEffect } */ from 'react';
import clsx from 'clsx';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import {
  Avatar,
  Button,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  TextField,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@material-ui/core';
import { ArrowBackRounded, MoreVertRounded, PhoneRounded, PhoneAndroidRounded } from '@material-ui/icons';
// #endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      backgroundColor: '#F7FBFA',
      padding: '28px 25px',
      width: 'max-content',
    },
    noPadding: {
      padding: 0,
    },
    wrap: {
      '&:last-child': {
        padding: 0,
      },
    },
    grid: {
      display: 'grid',
      gridGap: theme.spacing(2),
    },
    main: {
      gridTemplateColumns: 'auto minmax(auto, 420px)',
    },
    column: {
      gridTemplateRows: 'max-content',
    },
    center: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    list: {
      'color': '#747474',
      'padding': 0,

      '& > li': {
        minHeight: '48px',
        padding: '4px 16px',
      },
    },
    listItem: {
      'display': 'grid',
      'gridGap': theme.spacing(),
      'gridTemplateColumns': '120px auto',

      '& > .MuiListItemText-root': {
        margin: 0,
        display: 'flex',
        alignItems: 'center',
      },
    },
    topIcons: {
      justifyContent: 'space-between',
      display: 'flex',
    },
    firstName: {
      'display': 'flex',
      'flexDirection': 'column',

      'alignItems': 'center',
      '& > h2': {
        margin: 0,
        fontWeight: 500,
      },
    },
    avatar: {
      height: '180px',
      width: '180px',
    },

    // column: { flex: 1 },
    // list: { color: '#747474' },
    // listItem: { 'flexWrap': 'nowrap', '& > .MuiGrid-item:first-child': { marginRight: '10px' } },
  }),
);

interface ProfileProps {
  handleClose(): void;
}

export const ProfileComponent = (props: ProfileProps): React.ReactElement => {
  const classes = useStyles({});
  const { handleClose } = props;

  const avatar = 'https://pickaface.net/gallery/avatar/unr_example_170227_1250_yq2lr.png';

  return (
    <Card className={classes.root}>
      <CardContent className={clsx(classes.wrap, classes.noPadding)}>
        <div className={clsx(classes.grid, classes.main)}>
          <div className={clsx(classes.grid, classes.column)}>
            <div className={classes.topIcons}>
              <IconButton className={classes.noPadding} onClick={handleClose}>
                <ArrowBackRounded />
              </IconButton>
              <IconButton className={classes.noPadding}>
                <MoreVertRounded />
              </IconButton>
            </div>
            <div className={classes.center}>
              <Avatar alt="Avatar" src={avatar} className={classes.avatar} />
            </div>
            <div className={classes.firstName}>
              <h2>Иванова</h2>
              <h2>Ивана</h2>
              <h2>Ивановна</h2>
            </div>
            <div className={classes.center}>
              <span>ivanova.ii</span>
            </div>
            <div className={classes.center}>
              <PhoneAndroidRounded />
              <span>+7 (999) 123-45-67</span>
            </div>
            <div className={classes.center}>
              <PhoneRounded />
              <span>1234</span>
            </div>
            <div className={classes.center}>
              <span>mail-info@main-domain.com</span>
            </div>
          </div>
          <div className={clsx(classes.grid, classes.column)}>
            <div>
              <Paper>
                <List className={classes.list}>
                  <ListItem>
                    <div className={classes.listItem}>
                      <ListItemText primary="Компания" />
                      <ListItemText primary="НКО Благотворительный фонд помощи детям 'Анастасия'" />
                    </div>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <div className={classes.listItem}>
                      <ListItemText primary="Подразделение" />
                      <ListItemText primary="Департамент соц. медийн. проектов и корпорат. делопроизводства" />
                    </div>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <div className={classes.listItem}>
                      <ListItemText primary="Должность" />
                      <ListItemText primary="Заместитель директора департамента по кредитованию и опер. на ФР" />
                    </div>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <div className={classes.listItem}>
                      <ListItemText primary="Отдел" />
                      <ListItemText primary="Отдел закуп. работ и услуг подрядных организаций" />
                    </div>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <div className={classes.listItem}>
                      <ListItemText primary="Руководитель" />
                      <ListItemText primary="Иванов Иван Иванович" />
                    </div>
                  </ListItem>
                </List>
              </Paper>
            </div>
            <div>
              <Paper>
                <List className={classes.list}>
                  <ListItem>
                    <div className={classes.listItem}>
                      <ListItemText primary="Страна" />
                      <ListItemText primary="Россия" />
                    </div>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <div className={classes.listItem}>
                      <ListItemText primary="Область" />
                      <ListItemText primary="Новосибирская обл." />
                    </div>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <div className={classes.listItem}>
                      <ListItemText primary="Город" />
                      <ListItemText primary="Звенигород" />
                    </div>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <div className={classes.listItem}>
                      <ListItemText primary="Адрес" />
                      <ListItemText primary="Будённого 201" />
                    </div>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <div className={classes.listItem}>
                      <ListItemText primary="Комната" />
                      <ListItemText primary="105" />
                    </div>
                  </ListItem>
                </List>
              </Paper>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
