/** @format */

//#region Imports NPM
import React, { FC, useRef } from 'react';
import Link from 'next/link';
import { TFunction, I18n } from 'next-i18next';
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
import { useTranslation } from '@lib/i18n-client';
import type { DocFlowTargetComponentProps } from '@lib/types/docflow';
import dateFormat from '@lib/date-format';
import BoxWithRef from '@lib/box-ref';
import Search from '@front/components/ui/search';
import Loading from '@front/components/loading';
//#endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    notFounds: {
      color: '#949494',
    },
    control: {
      backgroundColor: fade(theme.palette.secondary.main, 0.05),
      borderBottom: '1px solid rgba(224, 224, 224, 1)',
    },
  }),
);

const DocFlowTargetComponent: FC<DocFlowTargetComponentProps> = ({ loading, target }) => {
  const classes = useStyles({});
  const { i18n, t } = useTranslation();

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" alignItems="center" p={1} className={classes.control} />
      <Loading activate={loading} full type="circular" color="secondary" disableShrink size={48}>
        {target?.name}
      </Loading>
    </Box>
  );
};

export default DocFlowTargetComponent;
