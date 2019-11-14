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
import HeaderBg from '../../../../public/images/jpeg/header_bg.jpg';
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
        maxHeight: '50vh',
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
  {
    name: 'thumbnailPhoto40',
    defaultStyle: { minWidth: 60, maxWidth: 60 },
    largeStyle: { minWidth: 60, maxWidth: 60 },
  },
  { name: 'lastName', defaultStyle: { minWidth: 160, maxWidth: 160 }, largeStyle: { minWidth: 200, maxWidth: 200 } },
  { name: 'nameEng', defaultStyle: { minWidth: 160, maxWidth: 160 }, largeStyle: { minWidth: 200, maxWidth: 200 } },
  { name: 'username', defaultStyle: { minWidth: 110, maxWidth: 110 }, largeStyle: { minWidth: 110, maxWidth: 110 } },
  { name: 'company', defaultStyle: { minWidth: 200, maxWidth: 200 }, largeStyle: { minWidth: 350, maxWidth: 350 } },
  { name: 'companyEng', defaultStyle: { minWidth: 200, maxWidth: 200 }, largeStyle: { minWidth: 350, maxWidth: 350 } },
  { name: 'department', defaultStyle: { minWidth: 260, maxWidth: 260 }, largeStyle: { minWidth: 350, maxWidth: 350 } },
  {
    name: 'departmentEng',
    defaultStyle: { minWidth: 260, maxWidth: 260 },
    largeStyle: { minWidth: 350, maxWidth: 350 },
  },
  { name: 'otdel', defaultStyle: { minWidth: 200, maxWidth: 200 }, largeStyle: { minWidth: 300, maxWidth: 300 } },
  { name: 'otdelEng', defaultStyle: { minWidth: 200, maxWidth: 200 }, largeStyle: { minWidth: 300, maxWidth: 300 } },
  { name: 'title', defaultStyle: { minWidth: 240, maxWidth: 240 }, largeStyle: { minWidth: 280, maxWidth: 280 } },
  { name: 'positionEng', defaultStyle: { minWidth: 200, maxWidth: 200 }, largeStyle: { minWidth: 250, maxWidth: 250 } },
  { name: 'manager', defaultStyle: { minWidth: 160, maxWidth: 160 }, largeStyle: { minWidth: 200, maxWidth: 200 } },
  { name: 'room', defaultStyle: { minWidth: 110, maxWidth: 110 }, largeStyle: { minWidth: 110, maxWidth: 110 } },
  { name: 'telephone', defaultStyle: { minWidth: 130, maxWidth: 130 }, largeStyle: { minWidth: 150, maxWidth: 150 } },
  { name: 'fax', defaultStyle: { minWidth: 140, maxWidth: 140 }, largeStyle: { minWidth: 160, maxWidth: 160 } },
  { name: 'mobile', defaultStyle: { minWidth: 130, maxWidth: 130 }, largeStyle: { minWidth: 150, maxWidth: 150 } },
  { name: 'workPhone', defaultStyle: { minWidth: 120, maxWidth: 120 }, largeStyle: { minWidth: 150, maxWidth: 150 } },
  { name: 'email', defaultStyle: { minWidth: 150, maxWidth: 150 }, largeStyle: { minWidth: 180, maxWidth: 180 } },
  { name: 'country', defaultStyle: { minWidth: 150, maxWidth: 150 }, largeStyle: { minWidth: 180, maxWidth: 180 } },
  { name: 'region', defaultStyle: { minWidth: 150, maxWidth: 150 }, largeStyle: { minWidth: 180, maxWidth: 180 } },
  { name: 'town', defaultStyle: { minWidth: 150, maxWidth: 150 }, largeStyle: { minWidth: 180, maxWidth: 180 } },
  { name: 'street', defaultStyle: { minWidth: 200, maxWidth: 200 }, largeStyle: { minWidth: 250, maxWidth: 250 } },
  { name: 'disabled', defaultStyle: { minWidth: 100, maxWidth: 100 }, largeStyle: { minWidth: 100, maxWidth: 100 } },
];

const countInBlocks = 4;

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

  const blocks = Math.ceil(allColumns.length / countInBlocks);

  return (
    <Card ref={ref} className={classes.root}>
      <CardHeader className={classes.head} title={t('phonebook:settings.header')} />
      <CardContent className={classes.wrapContent}>
        <div className={classes.content}>
          {[...Array(blocks).keys()].map((i) => (
            <FormControl key={i} className={classes.group}>
              <FormGroup>
                {allColumns.slice(i * countInBlocks, i * countInBlocks + countInBlocks).map(({ name }) => (
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
