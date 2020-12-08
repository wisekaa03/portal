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
  Paper,
  List,
  ListItem,
  ListItemText,
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
  TextField,
} from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import AttachFileIcon from '@material-ui/icons/AttachFile';
import HourglassFullIcon from '@material-ui/icons/HourglassFull';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
//#endregion
//#region Imports Local
import clearHtml from '@lib/clear-html';
import { useTranslation } from '@lib/i18n-client';
import { LARGE_RESOLUTION, TASK_STATUSES } from '@lib/constants';
import type { DocFlowTaskInfoCardProps, DocFlowFileProps, DocFlowTask, DocFlowTaskComponentProps } from '@lib/types/docflow';
import { DocFlowProcessStep } from '@lib/types/docflow';
import { ComposeLink } from '@front/components/compose-link';
import Avatar from '@front/components/ui/avatar';
import dateFormat from '@lib/date-format';
import BoxWithRef from '@lib/box-ref';
import Search from '@front/components/ui/search';
import Loading from '@front/components/loading';
import Errors from '@front/components/errors';
import DocFlowProcessStepButtons from './processStep';
//#endregion

const TaskInfoCard = withStyles((theme) => ({
  root: {
    borderRadius: theme.shape.borderRadius,
    background: fade(theme.palette.secondary.main, 0.15),
  },
  center: {
    textAlign: 'center',
  },
  content: {
    'padding': theme.spacing(0, 2),
    '&:first-child': {
      paddingTop: theme.spacing(2),
    },
    '&:last-child': {
      paddingBottom: theme.spacing(2),
    },
  },
  avatar: {
    height: 90,
    width: 90,
  },
  list: {
    '& > li': {
      display: 'grid',
      gap: `${theme.spacing()}px`,
      gridTemplateColumns: '1fr 2fr',
    },
  },
}))(({ classes, header, profile }: DocFlowTaskInfoCardProps) => {
  const { t } = useTranslation();

  if (typeof profile === 'string' || profile === null) {
    return null;
  }

  return (
    <Card className={classes.root}>
      <CardHeader
        disableTypography
        title={
          <Typography className={classes.center} variant="h6">
            {header}
          </Typography>
        }
      />
      <CardContent className={classes.content}>
        {profile && (
          <Box style={{ display: 'flex' }}>
            <Box>
              <Avatar className={classes.avatar} alt="photo" />
            </Box>
            <Box style={{ flex: 1 }}>
              <Paper>
                <List className={classes.list} disablePadding>
                  <ListItem divider>
                    <ListItemText primary={t('docflow:headers.name')} />
                    <ListItemText primary={profile.name} />
                  </ListItem>
                  {/*
                  <ListItem divider>
                    <ListItemText primary={t('phonebook:fields.title')} />
                    <ListItemText primary={profile.title} />
                  </ListItem>
                  <ListItem divider>
                    <ListItemText primary={t('phonebook:fields.telephone')} />
                    <ListItemText primary={profile.telephone} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary={t('phonebook:fields.email')} />
                    <ListItemText primary={<ComposeLink to={profile.email}>{profile.email}</ComposeLink>} />
                  </ListItem> */}
                </List>
              </Paper>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
});

const FilesArea = withStyles((theme) => ({
  files: {
    borderTop: '1px dotted #ccc',
    backgroundColor: '#F7FBFA',
    flexWrap: 'wrap',
    padding: `0 ${theme.spacing(1)}px`,
  },
  file: {
    padding: 0,
    width: '100%',
    textAlign: 'left',
    borderRadius: '0',
    justifyContent: 'flex-start',
    color: theme.palette.primary.main,
  },
  size: {
    textAlign: 'right',
    justifyContent: 'flex-end',
  },
  table: {},
  link: {
    'display': 'flex',
    'alignItems': 'center',
    'color': theme.palette.primary.main,
    'textDecoration': 'none',
    '&:link': { color: theme.palette.primary.main },
    '&:hover': { textDecoration: 'none' },
    '&:active': {
      color: darken(theme.palette.primary.main, 0.15),
    },
    '&:visited': { color: theme.palette.primary.main },
  },
}))(({ classes, task, loading, i18n, t, handleDownload }: DocFlowFileProps) => (
  <CardActions key={task.id} disableSpacing className={classes.files}>
    {task.targets?.map((target) => {
      const name = `${target.name}: ${target.target.name}`;

      const table = target.target.files?.object?.map((file) => (
        <TableRow hover key={file.id}>
          <TableCell style={{ width: '20px', minWidth: '20px' }} />
          <TableCell style={{ width: '36px' }}>
            <IconButton className={classes.file} size="small" onClick={() => handleDownload(file)}>
              <AttachFileIcon style={{ placeSelf: 'center' }} fontSize="small" />
              {loading ? <HourglassFullIcon style={{ placeSelf: 'center' }} fontSize="small" /> : <span />}
            </IconButton>
          </TableCell>
          <TableCell style={{ width: '90%' }}>
            <IconButton key={file.id} className={classes.file} size="small" onClick={() => handleDownload(file)}>
              <Typography variant="body2">{`${file.name}.${file.extension}`}</Typography>
            </IconButton>
          </TableCell>
          <TableCell style={{ minWidth: '260px' }}>
            <IconButton className={classes.file} size="small" onClick={() => handleDownload(file)}>
              {file.author?.name && (
                <Typography align="right" variant="body2">
                  {file.author.name}
                </Typography>
              )}
            </IconButton>
          </TableCell>
          <TableCell style={{ width: '174px', minWidth: '174px' }}>
            <IconButton className={classes.file} size="small" onClick={() => handleDownload(file)}>
              <Typography align="right" variant="body2">
                {dateFormat(file.modificationDateUniversal, i18n, t('docflow:undefined'))}
              </Typography>
            </IconButton>
          </TableCell>
          <TableCell style={{ textAlign: 'right', width: '100px', minWidth: '100px' }}>
            <IconButton className={clsx(classes.file, classes.size)} size="small" onClick={() => handleDownload(file)}>
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
        <Table key={target.target.id} aria-label="target files" className={classes.table}>
          <TableHead>
            <TableRow hover>
              <TableCell colSpan={6}>
                <Link href={{ pathname: '/docflow/target', query: { id: target?.target.id } }} as={`/docflow/target/${target.target.id}`}>
                  <a className={classes.link}>
                    <KeyboardArrowRightIcon />
                    <Typography component="span">{name}</Typography>
                  </a>
                </Link>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{table}</TableBody>
        </Table>
      );
    })}
  </CardActions>
));

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    control: {
      display: 'flex',
      alignItems: 'center',
      minHeight: theme.spacing(6),
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
      'display': 'grid',
      'alignItems': 'center',
      'alignContent': 'center',
      'padding': theme.spacing(0, 2),
      '&:first-child': {
        paddingTop: theme.spacing(2),
      },
      '&:last-child': {
        paddingBottom: theme.spacing(2),
      },
    },
    card: {
      display: 'grid',
      alignItems: 'center',
      alignContent: 'center',
      background: fade(theme.palette.secondary.main, 0.15),
      overflow: 'visible',
    },
    background: {
      background: fade(theme.palette.secondary.main, 0.15),
    },
    statusContent: {
      display: 'flex',
      gap: '10px',
      borderRadius: theme.shape.borderRadius,
      // 'gap': `${theme.spacing(4)}px`,
      // '&:last-child': {
      //   paddingBottom: theme.spacing(),
      // },
    },
  }),
);

const DocFlowTaskComponent: FC<DocFlowTaskComponentProps> = ({
  loading,
  errors,
  task,
  loadingFile,
  loadingProcessStep,
  comments,
  endDate,
  handleEndDate,
  handleComments,
  handleProcessStep,
  handleDownload,
}) => {
  const classes = useStyles({});
  const { i18n, t } = useTranslation();
  const tasksBox = useRef(null);

  const maxHeight = tasksBox.current ? `calc(100vh - ${(tasksBox.current as any)?.offsetTop}px)` : '100%';

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
      <Loading activate={loading} absolute full type="linear" color="secondary" noMargin disableShrink size={48}>
        {task ? (
          <BoxWithRef
            ref={tasksBox}
            style={{
              display: 'flex',
              overflow: 'auto',
              flexGrow: 1,
              flexWrap: 'wrap',
              marginTop: '0',
              marginBottom: '0',
              padding: '0',
              alignItems: 'stretch',
              justifyContent: 'flex-start',
              alignContent: 'flex-start',
              maxHeight,
            }}
          >
            <Box className={classes.content}>
              <Card className={clsx(classes.card, classes.fullRow)}>
                <CardHeader
                  disableTypography
                  className={clsx(classes.cardHeader, classes.background)}
                  title={
                    <Typography className={classes.cardHeaderTitle} variant="subtitle1">
                      {t('docflow:task.title', {
                        task: task.name,
                      })}
                    </Typography>
                  }
                />
              </Card>
              <Card className={classes.card}>
                <CardContent className={clsx(classes.cardContent, classes.statusContent)}>
                  <Typography variant="subtitle1" component="span">
                    {`${t('docflow:headers.author')}:`}
                  </Typography>
                  <Typography variant="subtitle1" style={{ placeSelf: 'center stretch' }} component="span">
                    {task.author?.name}
                  </Typography>
                </CardContent>
                <CardContent className={clsx(classes.cardContent, classes.statusContent)}>
                  <Typography variant="subtitle1" component="span">
                    {`${t('docflow:headers.performer')}:`}
                  </Typography>
                  <Typography variant="subtitle1" style={{ placeSelf: 'center stretch' }} component="span">
                    {task.performer?.name}
                  </Typography>
                </CardContent>
              </Card>
              <Card className={classes.card}>
                <CardContent className={clsx(classes.cardContent, classes.statusContent)}>
                  <Typography variant="subtitle1" component="span">
                    {`${t('docflow:headers.beginDate')}:`}
                  </Typography>
                  <Typography variant="subtitle1" style={{ placeSelf: 'center stretch' }} component="span">
                    {dateFormat(task.beginDate, i18n, t('docflow:undefined'))}
                  </Typography>
                </CardContent>
                <CardContent className={clsx(classes.cardContent, classes.statusContent)}>
                  <Typography variant="subtitle1" component="span">
                    {`${t('docflow:headers.dueDate')}:`}
                  </Typography>
                  <Typography variant="subtitle1" style={{ placeSelf: 'center stretch' }} component="span">
                    {dateFormat(task.dueDate, i18n, t('docflow:undefined'))}
                  </Typography>
                </CardContent>
                <CardContent className={clsx(classes.cardContent, classes.statusContent)}>
                  <Typography variant="subtitle1" component="span">
                    {`${t('docflow:headers.endDate')}:`}
                  </Typography>
                  <Typography variant="subtitle1" style={{ placeSelf: 'center stretch' }} component="span">
                    {dateFormat(task.endDate, i18n, t('docflow:undefined'))}
                  </Typography>
                </CardContent>
              </Card>
              <Card className={classes.card}>
                <CardContent className={clsx(classes.cardContent, classes.statusContent)}>
                  <Typography variant="subtitle1" component="span">
                    {`${t('docflow:headers.state')}:`}
                  </Typography>
                  <Typography variant="subtitle1" style={{ placeSelf: 'center stretch' }} component="span">
                    {task.state?.name}
                  </Typography>
                </CardContent>
              </Card>
              <Card className={classes.card}>
                <CardContent className={clsx(classes.cardContent, classes.statusContent)}>
                  <Typography variant="subtitle1" component="span">
                    {`${t('docflow:headers.importance')}:`}
                  </Typography>
                  <Typography variant="subtitle1" style={{ placeSelf: 'center stretch' }} component="span">
                    {task.importance?.name}
                  </Typography>
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
                <CardContent
                  className={classes.body}
                  dangerouslySetInnerHTML={{ __html: clearHtml(task.htmlView || t('docflow:undefined')) ?? '' }}
                />
                <FilesArea i18n={i18n} t={t} task={task} loading={loadingFile} handleDownload={handleDownload} />
              </Card>
              <div className={classes.fullRow}>
                <TextField
                  disabled={!task.changeRight}
                  label={t('docflow:headers.comments')}
                  multiline
                  fullWidth
                  rows={5}
                  defaultValue={comments}
                  onChange={handleComments}
                  variant="outlined"
                />
              </div>
              <div className={classes.fullRow}>
                <DocFlowProcessStepButtons
                  loading={!task.changeRight || loadingProcessStep}
                  endDate={endDate}
                  handleEndDate={handleEndDate}
                  handleProcessStep={handleProcessStep}
                  task={task}
                />
              </div>
            </Box>
          </BoxWithRef>
        ) : (
          <Errors errors={errors} />
        )}
      </Loading>
    </Box>
  );
};

export default DocFlowTaskComponent;
