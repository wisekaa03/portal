/** @format */

//#region Imports NPM
import React, { FC } from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import { TFunction, I18n } from 'next-i18next';
import { Theme, fade, makeStyles, createStyles } from '@material-ui/core/styles';
import {
  Box,
  IconButton,
  InputBase,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Divider,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  TablePagination,
} from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
//#endregion
//#region Imports Local
import { useTranslation } from '@lib/i18n-client';
import type { DocFlowInternalDocumentComponentProps } from '@lib/types/docflow';
import dateFormat from '@lib/date-format';
import BoxWithRef from '@lib/box-ref';
import Search from '@front/components/ui/search';
import Loading from '@front/components/loading';
import PortalErrors from '@front/components/errors';
//#endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    notFounds: {
      color: '#949494',
    },
    control: {
      display: 'flex',

      alignItems: 'center',
      backgroundColor: fade(theme.palette.secondary.main, 0.05),
      borderBottom: '1px solid rgba(224, 224, 224, 1)',
    },
    controlLeft: {
      'padding': 4,
      'color': theme.palette.secondary.main,
      'opacity': 0.6,
      'transition': `all 200ms ${theme.transitions.easing.easeOut} 0ms`,
      '&:hover': {
        opacity: 1,
        color: '#fff',
        backgroundColor: theme.palette.secondary.main,
      },
      'marginLeft': theme.spacing(),
    },
    cardHeaderTitle: {
      textAlign: 'center',
    },
    notFound: {
      color: '#949494',
    },
  }),
);

const DocFlowInternalDocumentComponent: FC<DocFlowInternalDocumentComponentProps> = ({ loading, errors, internalDocument }) => {
  const classes = useStyles({});
  const { t } = useTranslation();

  return (
    <Box style={{ display: 'flex', flexDirection: 'column' }}>
      <Box className={classes.control}>
        <Link href={{ pathname: '/docflow' }} as="/docflow" passHref>
          <IconButton className={classes.controlLeft}>
            <ArrowBackIcon />
          </IconButton>
        </Link>
        <div style={{ width: '100%' }} />
      </Box>
      {!internalDocument || loading ? (
        <Loading activate={loading} full type="circular" color="secondary" disableShrink size={48}>
          Loading...
        </Loading>
      ) : (
        <PortalErrors errors={errors} />
      )}
    </Box>
  );
};

export default DocFlowInternalDocumentComponent;
