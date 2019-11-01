/** @format */

// #region Imports NPM
import React, { useState } from 'react';
// import clsx from 'clsx';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import {
  Button,
  CardHeader,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  FormGroup,
  Checkbox,
  CardActions,
} from '@material-ui/core';
// #endregion
// #region Imports Local
import { nextI18next } from '../../lib/i18n-client';
import { Column, ColumnNames, SettingsProps } from './types';
import HeaderBg from '../../public/images/jpeg/header_bg.jpg';
// #endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      backgroundColor: '#F7FBFA',
      width: 'max-content',
      maxWidth: '95vw',
    },
    head: {
      display: 'flex',
      alignItems: 'flex-start',
      background: `url(${HeaderBg})`,
      backgroundSize: 'cover',
    },
    wrapContent: {
      padding: `${theme.spacing()}px ${theme.spacing(2)}px`,

      [theme.breakpoints.up('sm')]: {
        padding: `${theme.spacing(2)}px ${theme.spacing(4)}px`,
      },
    },
    content: {
      padding: theme.spacing() / 2,
      display: 'grid',

      [theme.breakpoints.down('md')]: {
        maxHeight: '75vh',
        overflowX: 'hidden',
        overflowY: 'auto',
        gridGap: theme.spacing(),
      },

      [theme.breakpoints.up('sm')]: {
        gridTemplateColumns: '1fr 1fr',
        gridGap: `0 ${theme.spacing(4)}px`,
      },

      [theme.breakpoints.up('lg')]: {
        gridTemplateColumns: '1fr 1fr 1fr',
      },
    },
    group: {
      boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.2)',
      padding: `${theme.spacing()}px 0`,
    },
    item: {
      margin: 0,
      padding: theme.spacing(),
      width: '360px',
      height: '56px',
    },
    actions: {
      'padding': `0 ${theme.spacing(4)}px ${theme.spacing(2)}px ${theme.spacing(4)}px`,
      'display': 'flex',
      'justifyContent': 'flex-end',
      '& > button': {
        borderRadius: '87px',
        marginLeft: theme.spacing(),
      },
    },
    buttonAccept: {
      backgroundColor: '#DEECEC',
    },
    buttonCancel: {
      backgroundColor: '#ECDEDE',
    },
  }),
);

export const allColumns: Column[] = [
  { name: 'thumbnailPhoto40', maxWidth: 60, minWidth: 60 },
  { name: 'lastName', minWidth: 160 },
  { name: 'nameEng', minWidth: 160 },
  { name: 'username', minWidth: 100, maxWidth: 120 },
  { name: 'company', minWidth: 200 },
  { name: 'companyEng', minWidth: 200 },
  { name: 'department', minWidth: 260 },
  { name: 'departmentEng', minWidth: 200 },
  { name: 'otdel', minWidth: 200 },
  { name: 'otdelEng', minWidth: 200 },
  { name: 'title', minWidth: 240 },
  { name: 'positionEng', minWidth: 200 },
  { name: 'manager', minWidth: 150 },
  { name: 'room', minWidth: 100 },
  { name: 'telephone', minWidth: 130 },
  { name: 'fax', minWidth: 140 },
  { name: 'mobile', minWidth: 130 },
  { name: 'workPhone', minWidth: 120 },
  { name: 'email', minWidth: 150 },
  { name: 'country', minWidth: 150 },
  { name: 'region', minWidth: 150 },
  { name: 'town', minWidth: 150 },
  { name: 'street', minWidth: 150 },
  { name: 'disabled', minWidth: 100 },
];

export const BaseSettingsComponent = React.forwardRef((props: SettingsProps, ref?: React.Ref<React.Component>) => {
  const classes = useStyles({});
  const { t, columns, changeColumn, handleClose } = props;
  const [current, setCurrent] = useState<ColumnNames[]>(columns);

  const handleCheckbox = (name: ColumnNames) => (e: React.ChangeEvent<HTMLInputElement>): void => {
    setCurrent(e.target.checked ? [name, ...current] : current.filter((el) => el !== name));
  };

  const handleAccept = (): void => {
    changeColumn(current);
    handleClose();
  };

  const blocks = Math.ceil(allColumns.length / 4);

  return (
    <Card ref={ref} className={classes.root}>
      <CardHeader className={classes.head} title={t('phonebook:settings.header')} />
      <CardContent className={classes.wrapContent}>
        <div className={classes.content}>
          {[...Array(blocks).keys()].map((i) => (
            <FormControl key={i} className={classes.group}>
              <FormGroup>
                {allColumns.slice(i * 4, i * 4 + 4).map(({ name }) => (
                  <FormControlLabel
                    key={name}
                    className={classes.item}
                    label={t(`phonebook:fields.${name}`)}
                    control={
                      <Checkbox color="primary" onChange={handleCheckbox(name)} checked={current.includes(name)} />
                    }
                  />
                ))}
              </FormGroup>
            </FormControl>
          ))}
        </div>
      </CardContent>
      <CardActions className={classes.actions} disableSpacing>
        <Button variant="contained" className={classes.buttonCancel} onClick={handleClose}>
          {t('common:cancel')}
        </Button>
        <Button variant="contained" className={classes.buttonAccept} onClick={handleAccept}>
          {t('common:accept')}
        </Button>
      </CardActions>
    </Card>
  );
});

export const SettingsComponent = React.memo(nextI18next.withTranslation('phonebook')(BaseSettingsComponent));
