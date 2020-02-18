/** @format */

// #region Imports NPM
import React, { FC } from 'react';
import Link from 'next/link';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { Box, Typography } from '@material-ui/core';
import clsx from 'clsx';
// #endregion
// #region Imports Local
import { ServicesElementProps, ServicesElementLinkQueryProps, ServicesElementType } from './types';
import BaseIcon from '../ui/icon';
import ConditionalWrapper from '../../lib/conditional-wrapper';
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
  }),
);

const pathname = '/services';

const getElement = (query: ServicesElementLinkQueryProps): ServicesElementType => {
  return !query ? 'department' : 'service' in query ? 'category' : 'service';
};

const ServicesElement: FC<ServicesElementProps> = ({ base64, active, element, linkQuery, withLink }) => {
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
          href={{
            pathname,
            query: { ...linkQuery, [getElement(linkQuery)]: element.code },
          }}
          as={`${linkAs}/${element.code}`}
        >
          {children}
        </Link>
      )}
    >
      <Box
        className={clsx(classes.root, {
          [classes.active]: active === element.code,
        })}
      >
        <div>
          <BaseIcon base64={base64} src={element.avatar} size={48} />
        </div>
        <div>
          <Typography variant="subtitle1">{element.name}</Typography>
        </div>
      </Box>
    </ConditionalWrapper>
  );
};

export default ServicesElement;
