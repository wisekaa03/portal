/** @format */

// #region Imports NPM
import React, { useState } from 'react';
// import clsx from 'clsx';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import {
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
import { nextI18next, useTranslation } from '@lib/i18n-client';
import { Column, ColumnNames, SettingsProps } from '@lib/types';
import Button from '@front/components/ui/button';
import HeaderBg from '@public/images/jpeg/header_bg.jpg';
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
      padding: theme.spacing(1, 2),

      [theme.breakpoints.up('sm')]: {
        padding: theme.spacing(2, 4),
      },
    },
    content: {
      padding: theme.spacing(0.5),
      display: 'grid',

      [theme.breakpoints.down('md')]: {
        maxHeight: '50vh',
        overflowX: 'hidden',
        overflowY: 'auto',
        gap: `${theme.spacing()}px`,
      },

      [theme.breakpoints.up('sm')]: {
        gridTemplateColumns: '1fr 1fr',
        gap: `${theme.spacing(0)}px ${theme.spacing(4)}px`,
      },

      [theme.breakpoints.up('lg')]: {
        gridTemplateColumns: '1fr 1fr 1fr',
      },
    },
    group: {
      boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.2)',
      padding: theme.spacing(1, 0),
    },
    item: {
      margin: 0,
      padding: theme.spacing(),
      width: '360px',
      height: '56px',
    },
    actions: {
      'padding': theme.spacing(0, 4, 2, 4),
      'display': 'flex',
      'justifyContent': 'flex-end',
      'alignItems': 'flex-end',
      'flexDirection': 'column',
      '& button:not(:last-child)': {
        marginBottom: theme.spacing(),
      },
      [theme.breakpoints.up('sm')]: {
        'flexDirection': 'row',

        '& button:not(:last-child)': {
          marginBottom: 0,
          marginRight: theme.spacing(),
        },
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
    admin: false,
    defaultStyle: { minWidth: 60, maxWidth: 60 },
    largeStyle: { minWidth: 60, maxWidth: 60 },
  },
  {
    name: 'lastName',
    admin: false,
    defaultStyle: { minWidth: 160, maxWidth: 160 },
    largeStyle: { minWidth: 180, maxWidth: 180 },
  },
  {
    name: 'nameeng',
    admin: false,
    defaultStyle: { minWidth: 160, maxWidth: 160 },
    largeStyle: { minWidth: 180, maxWidth: 180 },
  },
  {
    name: 'username',
    admin: false,
    defaultStyle: { minWidth: 110, maxWidth: 110 },
    largeStyle: { minWidth: 110, maxWidth: 110 },
  },
  {
    name: 'company',
    admin: false,
    defaultStyle: { minWidth: 200, maxWidth: 200 },
    largeStyle: { minWidth: 270, maxWidth: 270 },
  },
  {
    name: 'companyeng',
    admin: false,
    defaultStyle: { minWidth: 200, maxWidth: 200 },
    largeStyle: { minWidth: 270, maxWidth: 270 },
  },
  {
    name: 'department',
    admin: false,
    defaultStyle: { minWidth: 260, maxWidth: 260 },
    largeStyle: { minWidth: 270, maxWidth: 270 },
  },
  {
    name: 'departmenteng',
    admin: false,
    defaultStyle: { minWidth: 260, maxWidth: 260 },
    largeStyle: { minWidth: 270, maxWidth: 270 },
  },
  {
    name: 'otdel',
    admin: false,
    defaultStyle: { minWidth: 200, maxWidth: 200 },
    largeStyle: { minWidth: 270, maxWidth: 270 },
  },
  {
    name: 'otdeleng',
    admin: false,
    defaultStyle: { minWidth: 200, maxWidth: 200 },
    largeStyle: { minWidth: 270, maxWidth: 270 },
  },
  {
    name: 'title',
    admin: false,
    defaultStyle: { minWidth: 240, maxWidth: 240 },
    largeStyle: { minWidth: 240, maxWidth: 240 },
  },
  {
    name: 'positioneng',
    admin: false,
    defaultStyle: { minWidth: 200, maxWidth: 200 },
    largeStyle: { minWidth: 240, maxWidth: 240 },
  },
  {
    name: 'manager',
    admin: false,
    defaultStyle: { minWidth: 160, maxWidth: 160 },
    largeStyle: { minWidth: 200, maxWidth: 200 },
  },
  {
    name: 'room',
    admin: false,
    defaultStyle: { minWidth: 110, maxWidth: 110 },
    largeStyle: { minWidth: 110, maxWidth: 110 },
  },
  {
    name: 'telephone',
    admin: false,
    defaultStyle: { minWidth: 130, maxWidth: 130 },
    largeStyle: { minWidth: 130, maxWidth: 130 },
  },
  {
    name: 'fax',
    admin: false,
    defaultStyle: { minWidth: 140, maxWidth: 140 },
    largeStyle: { minWidth: 160, maxWidth: 160 },
  },
  {
    name: 'mobile',
    admin: false,
    defaultStyle: { minWidth: 130, maxWidth: 130 },
    largeStyle: { minWidth: 140, maxWidth: 140 },
  },
  {
    name: 'workPhone',
    admin: false,
    defaultStyle: { minWidth: 120, maxWidth: 120 },
    largeStyle: { minWidth: 120, maxWidth: 120 },
  },
  {
    name: 'email',
    admin: false,
    defaultStyle: { minWidth: 210, maxWidth: 210 },
    largeStyle: { minWidth: 250, maxWidth: 250 },
  },
  {
    name: 'country',
    admin: false,
    defaultStyle: { minWidth: 150, maxWidth: 150 },
    largeStyle: { minWidth: 180, maxWidth: 180 },
  },
  {
    name: 'region',
    admin: false,
    defaultStyle: { minWidth: 150, maxWidth: 150 },
    largeStyle: { minWidth: 180, maxWidth: 180 },
  },
  {
    name: 'town',
    admin: false,
    defaultStyle: { minWidth: 150, maxWidth: 150 },
    largeStyle: { minWidth: 180, maxWidth: 180 },
  },
  {
    name: 'street',
    admin: false,
    defaultStyle: { minWidth: 200, maxWidth: 200 },
    largeStyle: { minWidth: 250, maxWidth: 250 },
  },
  {
    name: 'disabled',
    admin: false,
    defaultStyle: { minWidth: 100, maxWidth: 100 },
    largeStyle: { minWidth: 100, maxWidth: 100 },
  },
  {
    name: 'notShowing',
    admin: true,
    defaultStyle: { minWidth: 100, maxWidth: 100 },
    largeStyle: { minWidth: 100, maxWidth: 100 },
  },
];

const countInBlocks = 4;

const PhonebookSettings = React.forwardRef(
  ({ columns, changeColumn, handleClose, handleReset, isAdmin }: SettingsProps, ref?: React.Ref<React.Component>) => {
    const classes = useStyles({});
    const { t } = useTranslation();
    const [current, setCurrent] = useState<ColumnNames[]>(columns);

    const handleCheckbox = (name: ColumnNames) => (e: React.ChangeEvent<HTMLInputElement>): void => {
      setCurrent(e.target.checked ? [name, ...current] : current.filter((el) => el !== name));
    };

    const handleAccept = (): void => {
      changeColumn(current);
      handleClose();
    };

    const renderColumns = allColumns.filter(({ admin }) => isAdmin || !admin);
    const blocks = Math.ceil(renderColumns.length / countInBlocks);

    return (
      <Card ref={ref} className={classes.root}>
        <CardHeader className={classes.head} title={t('phonebook:settings.header')} />
        <CardContent className={classes.wrapContent}>
          <div className={classes.content}>
            {[...Array(blocks).keys()].map((i) => (
              <FormControl key={i} className={classes.group}>
                <FormGroup>
                  {renderColumns.slice(i * countInBlocks, i * countInBlocks + countInBlocks).map(({ name }: Column) => (
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
          <Button actionType="cancel" onClick={handleClose}>
            {t('common:cancel')}
          </Button>
          <Button actionType="reset" onClick={handleReset}>
            {t('common:reset')}
          </Button>
          <Button onClick={handleAccept}>{t('common:accept')}</Button>
        </CardActions>
      </Card>
    );
  },
);

export default nextI18next.withTranslation('phonebook')(PhonebookSettings);
