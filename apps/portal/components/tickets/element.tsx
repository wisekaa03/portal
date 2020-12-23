/** @format */

//#region Imports NPM
import React, { FC, useState, useMemo } from 'react';
import Link from 'next/link';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { Box, Typography } from '@material-ui/core';
import clsx from 'clsx';
//#endregion
//#region Imports Local
import type { TkService } from '@back/tickets/graphql/TkService';
import { useTranslation } from '@lib/i18n-client';
import { ServicesElementProps } from '@lib/types';
import { Icon } from '@front/components/ui/icon';
//#endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      'padding': theme.spacing(2),
      'borderRadius': theme.shape.borderRadius,
      'display': 'grid',
      'gridTemplateColumns': '60px 1fr',
      'gap': `${theme.spacing()}px`,
      'justifyItems': 'flex-start',
      'alignItems': 'center',
      'alignContent': 'flex-start',
      'height': '100%',
      // 'width': 'max-content',
      'width': '100%',
      'cursor': 'pointer',
      'color': '#484848',
      '&:hover:not($active)': {
        'backgroundColor': '#E9F2F5',
        '-webkit-box-shadow': '5px 5px 5px -5px rgba(0,0,0,0.5)',
        '-moz-box-shadow': '5px 5px 5px -5px rgba(0,0,0,0.5)',
        'boxShadow': '5px 5px 5px -5px rgba(0,0,0,0.5)',
      },
    },
    active: {
      padding: 0,
      // cursor: 'default',
    },
    moreOpen: {
      backgroundColor: '#E9F2F5',
    },
    info: {
      display: 'grid',
      gap: `${theme.spacing(0.5)}px`,
      // borderBottom: '1px solid rgba(46, 45, 43, 0.7)',
      // gridTemplateRows: `repeat(1, ${theme.spacing(3)}px)`,
      // gridTemplateColumns: `1fr 24px`,
      minWidth: 200,
      width: 400,
      // maxWidth: 400,
    },
    name: {
      'overflow': 'hidden',
      'textOverflow': 'ellipsis',
      'whiteSpace': 'nowrap',
      'letterSpacing': 0.15,
      'color': '#31312F',
      // 'color': '#0173c1',
      '&:hover': {
        // color: '#000',
        color: '#0173c1',
        // color: '#013e83',
      },
    },
    href: {
      'textDecoration': 'none',
      'color': '#31312F',
      // 'color': '#0173c1',
      '&:hover': {
        // color: '#000',
        // color: '#013e83',
        color: '#0173c1',
      },
    },
    comma: {
      '&::after': {
        content: '", "',
      },
      '&:last-child::after': {
        content: '""',
      },
    },
    description: {
      gridArea: '2/1/2/3',
      width: '100%',
      height: '100%',
    },
    more: {
      'gridRowStart': 1,
      'gridRowEnd': 3,
      'gridColumnStart': 2,
      'padding': theme.spacing(0.25, 0),

      '&:hover': {
        color: '#808080',
      },
    },
    moreButton: {
      padding: 0,
    },
  }),
);

const pathname = '/tickets';

const ServicesElement: FC<ServicesElementProps> = ({ base64, active, route, url, withLink }) => {
  const classes = useStyles({});
  const { t } = useTranslation();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const allServices = useMemo<TkService[]>(
    () =>
      Array.isArray(route.services) && route.services.length > 0
        ? route.services.reduce(
            (accumulator, srv) =>
              !srv || (!active && srv?.name === 'Прочее') || accumulator.reduce((a, v) => `${a}${v.name}`, '').length > 150
                ? accumulator
                : [...accumulator, srv],
            [] as TkService[],
          )
        : [],
    [route, active],
  );

  return (
    <Link
      key={`a-${route.where}-${route.code}`}
      href={{
        pathname,
        query: { where: route.where, route: route.code },
      }}
      as={`${pathname}/${route.where}/${route.code}`}
      passHref
    >
      <Box
        className={clsx(classes.root, {
          [classes.active]: active,
          [classes.moreOpen]: !!anchor,
        })}
      >
        <Box>
          <Icon base64={base64} src={route.avatar} size={48} />
        </Box>
        <Box className={classes.info}>
          <Typography variant="subtitle1" className={classes.name}>
            {route.name}
          </Typography>
        </Box>
        <Box className={classes.description}>
          {allServices.map((current: TkService) => (
            <Link
              key={`${route.where}-${route.code}-${current.code}`}
              href={{
                pathname,
                query: { where: route.where, route: route.code, service: current.code },
              }}
              as={`${pathname}/${route.where}/${route.code}/${current.code}`}
              passHref
            >
              <a className={clsx(classes.href, classes.comma)}>{current.name}</a>
            </Link>
          ))}
          {Array.isArray(route.services) && route.services.length !== allServices.length && (
            <Link
              key={`m-${route.where}-${route.code}`}
              href={{
                pathname,
                query: { where: route.where, route: route.code },
              }}
              as={`${pathname}/${route.where}/${route.code}`}
              passHref
            >
              <a className={classes.href}>{t('common:more')}</a>
            </Link>
          )}
        </Box>
      </Box>
    </Link>
  );
};

// </ConditionalWrapper>

export default ServicesElement;
