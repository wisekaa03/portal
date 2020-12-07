/** @format */

//#region Imports NPM
import React, { FC } from 'react';
import { Theme, fade, darken, makeStyles, createStyles, withStyles } from '@material-ui/core/styles';
import {
  Box,
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
//#endregion
//#region Imports Local
import snackbarUtils from '@lib/snackbar-utils';
import { PortalErrorsProps } from '@lib/types/errors';
import { useTranslation } from '@lib/i18n-client';
import { useEffect } from '@storybook/addons';
import { ApolloError } from '@apollo/client';
//#endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    error: {
      display: 'flex',
      width: '100%',
      height: '100%',
      alignContent: 'center',
      alignItems: 'center',
      justifyContent: 'center',
    },
    errorText: {
      color: '#949494',
    },
  }),
);

const PortalErrors: FC<PortalErrorsProps> = ({ errors }) => {
  const classes = useStyles({});
  const { i18n, t } = useTranslation();

  if (Array.isArray(errors)) {
    errors.forEach((error) => error && snackbarUtils.error(error));
  } else if (errors instanceof ApolloError) {
    snackbarUtils.error(errors);
  }

  return (
    <Box className={classes.error}>
      <Typography className={classes.errorText} variant="h4">
        {t('common:errors.notFound')}
      </Typography>
    </Box>
  );
};

export default PortalErrors;
