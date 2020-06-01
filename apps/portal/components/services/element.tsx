/** @format */

//#region Imports NPM
import React, { FC, useState, useMemo } from 'react';
import Link from 'next/link';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { Box, Typography } from '@material-ui/core';
import clsx from 'clsx';
//#endregion
//#region Imports Local
import { useTranslation } from '@lib/i18n-client';
import { ServicesElementProps } from '@lib/types';
import ConditionalWrapper from '@lib/conditional-wrapper';
import BaseIcon from '@front/components/ui/icon';
import { TkService, TkRoute } from '@lib/types/tickets';
//#endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      'padding': theme.spacing(2),
      'borderRadius': theme.spacing(),
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
        backgroundColor: '#E9F2F5',
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
      'fontSize': theme.spacing(2),
      'letterSpacing': 0.15,
      'color': '#31312F',
      // 'color': '#0173c1',
      '&:hover': {
        // color: '#000',
        color: '#0173c1',
        // color: '#013e83',
      },
    },
    a: {
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
    subtitle: {
      'fontSize': theme.spacing(1.5),
      'letterSpacing': 0.25,
      // 'color': '#0173c1',
      'display': 'inline-flex',
      '&:hover': {
        // color: '#013e83',
      },
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

const pathname = '/services';

const ServicesElement: FC<ServicesElementProps> = ({ base64, active, route, url, withLink }) => {
  const classes = useStyles({});
  const { t } = useTranslation();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const allServices = useMemo<TkService[]>(
    () =>
      route.services?.reduce(
        // eslint-disable-next-line no-confusing-arrow
        (acc, srv) =>
          (!active && srv.name === 'Прочее') || acc.reduce((a, v) => `${a}${v.name}`, '').length > 150
            ? acc
            : [...acc, srv],
        [] as TkService[],
      ),
    [route, active],
  );

  //   <ConditionalWrapper
  //   condition={withLink}
  //   wrapper={(children) => (
  //     <Link
  //       href={
  //         url || {
  //           pathname,
  //           query: { where: route.where, route: route.code },
  //         }
  //       }
  //       as={url || `${pathname}/${route.where}/${route.code}`}
  //       passHref
  //     >
  //       {url ? <a target="_blank">{children}</a> : children}
  //     </Link>
  //   )}
  // >

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
          <BaseIcon base64={base64} src={route.avatar} size={48} />
        </Box>
        <Box className={classes.info}>
          <Typography variant="subtitle1" className={classes.name}>
            {route.name}
          </Typography>
        </Box>
        <Box className={classes.description}>
          {allServices.map((cur: TkService) => (
            <Link
              key={`${route.where}-${route.code}-${cur.code}`}
              href={{
                pathname,
                query: { where: route.where, route: route.code, service: cur.code },
              }}
              as={`${pathname}/${route.where}/${route.code}/${cur.code}`}
              passHref
            >
              <a className={clsx(classes.a, classes.comma)}>{cur.name}</a>
            </Link>
          ))}
          {route.services.length !== allServices.length && (
            <Link
              key={`m-${route.where}-${route.code}`}
              href={{
                pathname,
                query: { where: route.where, route: route.code },
              }}
              as={`${pathname}/${route.where}/${route.code}`}
              passHref
            >
              <a className={classes.a}>{t('common:more')}</a>
            </Link>
          )}
        </Box>
      </Box>
    </Link>
  );
};

// </ConditionalWrapper>

export default ServicesElement;
