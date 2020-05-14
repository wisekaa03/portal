/** @format */

// #region Imports NPM
import React, { FC } from 'react';
import Link from 'next/link';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { Box, Typography } from '@material-ui/core';
import clsx from 'clsx';
// #endregion
// #region Imports Local
import { ServicesElementProps, ServicesElementLinkQueryProps, ServicesElementType } from '@lib/types';
import ConditionalWrapper from '@lib/conditional-wrapper';
import BaseIcon from '@front/components/ui/icon';
// #endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      'padding': theme.spacing(),
      'borderRadius': theme.spacing(0.5),
      'display': 'grid',
      'gridTemplateColumns': '60px 1fr',
      'gap': `${theme.spacing()}px`,
      'justifyItems': 'flex-start',
      'alignItems': 'center',
      'height': '100%',
      // '&:not($formControl)': {
      'cursor': 'pointer',
      // },
      'color': '#484848',
      // '&:hover:not($active):not($serviceBox) h6': {
      '&:hover:not($active) h6': {
        color: '#000',
      },
    },
    active: {
      '& h6': {
        color: '#000',
      },
    },
    info: {
      'display': 'grid',
      'gap': `${theme.spacing(0.5)}px`,
      'borderBottom': '1px solid rgba(46, 45, 43, 0.7)',
      'gridTemplateRows': `repeat(2, ${theme.spacing(3)}px)`,
      'minWidth': 200,

      '& > $name, & > $subtitle': {
        display: 'flex',
        alignItems: 'flex-start',
      },
    },
    name: {
      fontSize: theme.spacing(2),
      letterSpacing: 0.15,
    },
    subtitle: {
      fontSize: theme.spacing(1.5),
      letterSpacing: 0.25,
    },
  }),
);

const pathname = '/services';

const getElement = (query: ServicesElementLinkQueryProps): ServicesElementType => {
  return !query ? 'department' : 'service' in query ? 'category' : 'service';
};

const ServicesElement: FC<ServicesElementProps> = ({ base64, active, element, linkQuery, url, withLink }) => {
  const classes = useStyles({});

  let linkAs = pathname;

  if (withLink && linkQuery) {
    linkAs += `/${Object.values(linkQuery).join('/')}`;
  }

  return (
    <ConditionalWrapper
      condition={withLink}
      wrapper={(children) => (
        <Link
          href={
            url || {
              pathname,
              query: { ...linkQuery, [getElement(linkQuery)]: element.code },
            }
          }
          as={url || `${linkAs}/${element.code}`}
          passHref
        >
          {url ? <a target="_blank">{children}</a> : children}
        </Link>
      )}
    >
      <Box
        boxShadow={active === element.code ? 3 : 0}
        className={clsx(classes.root, {
          [classes.active]: active === element.code,
        })}
      >
        <div>
          <BaseIcon base64={base64} src={element.avatar} size={48} />
        </div>
        <Box className={classes.info}>
          <Typography variant="subtitle1" className={classes.name}>
            {element.name}
          </Typography>
          <Typography variant="subtitle1" className={classes.subtitle}>
            {element.subtitle}
          </Typography>
        </Box>
      </Box>
    </ConditionalWrapper>
  );
};

export default ServicesElement;
