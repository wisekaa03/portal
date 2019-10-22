/** @format */
/* eslint prettier/prettier:0 */

// #region Imports NPM
import React /* , { useState, useEffect } */ from 'react';
import clsx from 'clsx';
import { useQuery } from '@apollo/react-hooks';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import {
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
// #region Imports Local
import { useTranslation } from '../../lib/i18n-client';
import { ProfileProps } from './types';
import { Avatar } from '../avatar';
import { PROFILE } from '../../lib/queries';
import { Loading } from '../loading';
// #endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      backgroundColor: '#F7FBFA',
      padding: '24px 21px',
      width: 'max-content',
      maxWidth: '95vw',
    },
    noPadding: {
      padding: 0,
    },
    wrap: {
      '&:last-child': {
        padding: 0,
        maxHeight: '90vh',
        overflow: 'auto',
      },
    },
    grid: {
      display: 'grid',
      gridGap: theme.spacing(2),
      padding: theme.spacing() / 2,
    },
    main: {
      [theme.breakpoints.up('sm')]: {
        gridTemplateColumns: 'auto minmax(auto, 420px)',
      },
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

export const ProfileComponent = React.forwardRef((props: ProfileProps, ref?: React.Ref<React.Component>) => {
  const classes = useStyles({});
  const { t, i18n } = useTranslation();
  const { profileId, handleClose } = props;

  if (!profileId) return null;

  const { loading, error, data } = useQuery(PROFILE, {
    variables: {
      id: profileId,
    },
  });

  const profile = !loading && data.profile;

  return (
    <Card ref={ref} className={classes.root}>
      <CardContent className={clsx(classes.wrap, classes.noPadding)}>
        {!profile ? (
          <Loading />
        ) : (
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
                <Avatar className={classes.avatar} profile={profile} />
              </div>
              <div className={classes.firstName}>
                <h2>{profile.lastName}</h2>
                <h2>{profile.firstName}</h2>
                <h2>{profile.middleName}</h2>
              </div>
              <div className={classes.center}>
                <span>{profile.nameEng}</span>
              </div>
              {profile.telephone && (
                <div className={classes.center}>
                  <PhoneAndroidRounded />
                  <span>{profile.telephone}</span>
                </div>
              )}
              {profile.workPhone && (
                <div className={classes.center}>
                  <PhoneRounded />
                  <span>{profile.workPhone}</span>
                </div>
              )}
              {profile.email && (
                <div className={classes.center}>
                  <span>{profile.email}</span>
                </div>
              )}
            </div>
            <div className={clsx(classes.grid, classes.column)}>
              <div>
                <Paper>
                  <List className={classes.list}>
                    <ListItem>
                      <div className={classes.listItem}>
                        <ListItemText primary={t(`phonebook:fields.company`)} />
                        <ListItemText primary={profile.company} />
                      </div>
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <div className={classes.listItem}>
                        <ListItemText primary={t(`phonebook:fields.department`)} />
                        <ListItemText primary={profile.department} />
                      </div>
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <div className={classes.listItem}>
                        <ListItemText primary={t(`phonebook:fields.title`)} />
                        <ListItemText primary={profile.title} />
                      </div>
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <div className={classes.listItem}>
                        <ListItemText primary={t(`phonebook:fields.otdel`)} />
                        <ListItemText primary={profile.otdel} />
                      </div>
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <div className={classes.listItem}>
                        <ListItemText primary={t(`phonebook:fields.supervisor`)} />
                        <ListItemText primary="" />
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
                        <ListItemText primary={t(`phonebook:fields.country`)} />
                        <ListItemText primary={profile.addressPersonal.country} />
                      </div>
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <div className={classes.listItem}>
                        <ListItemText primary={t(`phonebook:fields.region`)} />
                        <ListItemText primary={profile.addressPersonal.region} />
                      </div>
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <div className={classes.listItem}>
                        <ListItemText primary={t(`phonebook:fields.city`)} />
                        <ListItemText primary="" />
                      </div>
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <div className={classes.listItem}>
                        <ListItemText primary={t(`phonebook:fields.street`)} />
                        <ListItemText primary={profile.addressPersonal.street} />
                      </div>
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <div className={classes.listItem}>
                        <ListItemText primary={t(`phonebook:fields.postalCode`)} />
                        <ListItemText primary={profile.addressPersonal.postalCode} />
                      </div>
                    </ListItem>
                  </List>
                </Paper>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
