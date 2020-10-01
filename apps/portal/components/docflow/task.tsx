/** @format */

//#region Imports NPM
import React, { FC, useRef } from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import filesize from 'filesize';
import { TFunction, I18n } from 'next-i18next';
import { Theme, fade, darken, makeStyles, createStyles, withStyles } from '@material-ui/core/styles';
import {
  Box,
  IconButton,
  InputBase,
  Card,
  CardHeader,
  CardContent,
  CardActionArea,
  Typography,
  Divider,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  TablePagination,
  CardActions,
  Icon,
} from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import AttachFileIcon from '@material-ui/icons/AttachFile';
import HourglassFullIcon from '@material-ui/icons/HourglassFull';
//#endregion
//#region Imports Local
import { useTranslation } from '@lib/i18n-client';
import { LARGE_RESOLUTION, TASK_STATUSES } from '@lib/constants';
import type { DocFlowTask, DocFlowTaskComponentProps } from '@lib/types/docflow';
import dateFormat from '@lib/date-format';
import BoxWithRef from '@lib/box-ref';
import Search from '@front/components/ui/search';
import Loading from '@front/components/loading';
import { TableColumn } from 'typeorm';
//#endregion

const FilesArea = withStyles((theme) => ({
  files: {
    borderTop: '1px dotted #ccc',
    backgroundColor: '#F7FBFA',
    flexWrap: 'wrap',
  },
  file: {
    padding: 0,
    width: '100%',
    textAlign: 'left',
    borderRadius: '0',
    justifyContent: 'flex-start',
    color: '#3C6AA3',
  },
  size: {
    textAlign: 'right',
    justifyContent: 'flex-end',
  },
}))(
  ({
    classes,
    task,
    loading,
    i18n,
    t,
    handleDownload,
  }: {
    task: DocFlowTask;
    loading: boolean;
    handleDownload;
    i18n: I18n;
    t: TFunction;
    classes: Record<string, string>;
  }) => {
    if (Array.isArray(task?.targets) && task.targets.length > 0) {
      return (
        <CardActions key={task.id} disableSpacing className={classes.files}>
          {task?.targets?.map((target) => {
            const { name } = target;

            const table = target?.target?.files?.object?.map((file) => (
              <TableRow key={file.id}>
                <TableCell style={{ width: '36px' }}>
                  <IconButton className={classes.file} size="small" onClick={() => handleDownload(task, file)}>
                    <AttachFileIcon style={{ placeSelf: 'center' }} fontSize="small" />
                    {loading ? <HourglassFullIcon style={{ placeSelf: 'center' }} fontSize="small" /> : <span />}
                  </IconButton>
                </TableCell>
                <TableCell style={{ width: '90%' }}>
                  <IconButton key={file.id} className={classes.file} size="small" onClick={() => handleDownload(task, file)}>
                    <Typography variant="body2">{`${file.name}.${file.extension}`}</Typography>
                  </IconButton>
                </TableCell>
                <TableCell style={{ minWidth: '260px' }}>
                  <IconButton className={classes.file} size="small" onClick={() => handleDownload(task, file)}>
                    {file.author?.name && (
                      <Typography align="right" variant="body2">
                        {file.author.name}
                      </Typography>
                    )}
                  </IconButton>
                </TableCell>
                <TableCell style={{ width: '174px', minWidth: '174px' }}>
                  <IconButton className={classes.file} size="small" onClick={() => handleDownload(task, file)}>
                    <Typography align="right" variant="body2">
                      {dateFormat(file.modificationDateUniversal, i18n)}
                    </Typography>
                  </IconButton>
                </TableCell>
                <TableCell style={{ textAlign: 'right', width: '100px', minWidth: '100px' }}>
                  <IconButton className={clsx(classes.file, classes.size)} size="small" onClick={() => handleDownload(task, file)}>
                    {file.size && (
                      <Typography align="right" variant="body2">
                        {filesize(file.size, { locale: i18n.language })}
                      </Typography>
                    )}
                  </IconButton>
                </TableCell>
              </TableRow>
            ));

            return (
              <Table key={target.target.id}>
                <TableHead>
                  <TableRow>
                    <TableCell align="center" colSpan={5}>
                      {t('docflow:headers.files')}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>{table}</TableBody>
              </Table>
            );
          })}
        </CardActions>
      );
    }

    return null;
  },
);

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    notFounds: {
      color: '#949494',
    },
    control: {
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
    content: {
      display: 'grid',
      alignSelf: 'center',
      margin: '16px auto',
      gap: `${theme.spacing(4)}px ${theme.spacing(2)}px`,
      width: '100%',
      gridTemplateColumns: '1fr',
      [`@media (min-width:${LARGE_RESOLUTION}px)`]: {
        width: '80%',
      },
      [theme.breakpoints.up('md')]: {
        padding: theme.spacing(),
        gridTemplateColumns: '1fr 1fr',
      },
    },
    fullRow: {
      overflow: 'visible',
      [theme.breakpoints.up('md')]: {
        gridColumnStart: 1,
        gridColumnEnd: 3,
      },
    },
    body: {
      paddingTop: theme.spacing(3),
      paddingBottom: theme.spacing(3),
      fontSize: '1.3em',
    },
    cardHeader: {
      padding: theme.spacing(),
    },
    cardContent: {
      'padding': theme.spacing(0, 2),
      '&:first-child': {
        paddingTop: theme.spacing(2),
      },
      '&:last-child': {
        paddingBottom: theme.spacing(2),
      },
    },
    background: {
      background: fade(theme.palette.secondary.main, 0.15),
    },
    statusContent: {
      display: 'grid',
      gridTemplateColumns: '60px 1fr',
      background: fade(theme.palette.secondary.main, 0.15),
      borderRadius: theme.shape.borderRadius,
      // 'gap': `${theme.spacing(4)}px`,
      // '&:last-child': {
      //   paddingBottom: theme.spacing(),
      // },
    },
  }),
);

const DocFlowTaskComponent: FC<DocFlowTaskComponentProps> = ({ loading, task, handleDownload }) => {
  const classes = useStyles({});
  const { i18n, t } = useTranslation();

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" alignItems="center" p={1} className={classes.control}>
        <Link href={{ pathname: '/docflow' }} as="/docflow" passHref>
          <IconButton className={classes.controlLeft}>
            <ArrowBackIcon />
          </IconButton>
        </Link>
        <div style={{ width: '100%' }} />
      </Box>
      {!task || loading ? (
        <Loading activate={loading} full type="circular" color="secondary" disableShrink size={48}>
          <Typography className={clsx(classes.cardHeaderTitle, classes.notFound)} variant="h4">
            {t('docflow:notFound')}
          </Typography>
        </Loading>
      ) : (
        <Box style={{ overflow: 'auto' }}>
          <Box className={classes.content}>
            <Card className={classes.fullRow}>
              <CardHeader
                disableTypography
                className={clsx(classes.cardHeader, classes.background)}
                title={
                  <>
                    <Typography className={classes.cardHeaderTitle} variant="subtitle1">
                      {t('docflow:task.title', {
                        task: task.name,
                      })}
                    </Typography>
                    <Typography className={classes.cardHeaderTitle} variant="subtitle1">
                      {dateFormat(task.beginDate, i18n)}
                    </Typography>
                  </>
                }
              />
            </Card>
            {/* <TaskInfoCard header={t('tasks:headers.author')} profile={task.initiatorUser} />
              <TaskInfoCard header={t('tasks:headers.executor')} profile={task.executorUser} />*/}
            {/* <Card style={{ overflow: 'visible' }}>
              <CardContent className={clsx(classes.cardContent, classes.statusContent)}>
                <Icon base64 src={task.service?.avatar || task.route?.avatar} size={48} />
                <span style={{ placeSelf: 'center stretch' }}>
                  <Typography variant="subtitle1">{task.route?.name}</Typography>
                  <Typography variant="subtitle2">{task.service?.name}</Typography>
            </span>
              </CardContent>
            </Card> */}
            <Card style={{ overflow: 'visible' }}>
              <CardHeader
                disableTypography
                className={clsx(classes.cardHeader, classes.background)}
                title={
                  <Typography className={classes.cardHeaderTitle} variant="subtitle1">
                    {t('docflow:headers.state')}
                  </Typography>
                }
              />
              <CardContent className={clsx(classes.cardContent, classes.statusContent)}>
                {/* <Icon src={getTicketStatusIcon(task.status)} size={48} /> */}
                <span style={{ placeSelf: 'center stretch' }}>{task.state?.name}</span>
              </CardContent>
            </Card>
            <Card className={classes.fullRow}>
              <CardHeader
                disableTypography
                className={clsx(classes.cardHeader, classes.background)}
                title={
                  <Typography className={classes.cardHeaderTitle} variant="subtitle1">
                    {t('docflow:headers.description')}
                  </Typography>
                }
              />
              <CardContent className={classes.body} dangerouslySetInnerHTML={{ __html: task.htmlView ?? '' }} />
              <FilesArea i18n={i18n} t={t} task={task} loading={loading} handleDownload={handleDownload} />
            </Card>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default DocFlowTaskComponent;
