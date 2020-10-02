/** @format */
/* eslint no-use-before-define:0 */

//#region Imports NPM
import React, { FC } from 'react';
import clsx from 'clsx';
import { fade, Theme, makeStyles, createStyles, withStyles } from '@material-ui/core/styles';
import {
  Box,
  IconButton,
  Card,
  CardHeader,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  CardActions,
} from '@material-ui/core';
import Link from 'next/link';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import AttachFileIcon from '@material-ui/icons/AttachFile';
import HourglassFullIcon from '@material-ui/icons/HourglassFull';
//#endregion
//#region Imports Local
import dateFormat from '@lib/date-format';
import { useTranslation } from '@lib/i18n-client';
import { LARGE_RESOLUTION } from '@lib/constants';
import type { TaskInfoCardProps, TaskComponentProps, TaskFilesAreaProps } from '@lib/types';
import Avatar from '@front/components/ui/avatar';
import Loading from '@front/components/loading';
import { Icon } from '@front/components/ui/icon';
import { ComposeLink } from '@front/components/compose-link';
import TaskIconNew from '@public/images/svg/task/task_new.svg';
import TaskIconPause from '@public/images/svg/task/task_pause.svg';
import TaskIconWorked from '@public/images/svg/task/task_worked.svg';
import TaskIconComplete from '@public/images/svg/task/task_complete.svg';
//#endregion

const getTicketStatusIcon = (status: string): any => {
  switch (status) {
    case 'Регистрация':
    case 'Новый':
      return TaskIconNew;
    case 'В работе':
    case 'Открыто':
    case 'Открытая':
    case 'Open':
      return TaskIconWorked;
    case 'Выполнено':
    case 'Завершено':
      return TaskIconComplete;
    default:
      return TaskIconPause;
  }
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {},
    control: {
      backgroundColor: fade(theme.palette.secondary.main, 0.05),
      borderBottom: '1px solid rgba(224, 224, 224, 1)',
      marginTop: theme.spacing() / 4,
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
    rounded: {
      borderRadius: theme.shape.borderRadius,
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
    cardHeaderTitle: {
      textAlign: 'center',
    },
    notFound: {
      color: '#949494',
    },
    body: {
      paddingTop: theme.spacing(3),
      paddingBottom: theme.spacing(3),
      fontSize: '1.3em',
    },
    label: {
      padding: '8px 6px 8px 0',
    },
    statusBox: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: `${theme.spacing(2)}px`,
      [theme.breakpoints.up('md')]: {
        gridTemplateColumns: '1fr 1fr',
        gap: `${theme.spacing(8)}px`,
      },
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
    formControl: {},
    formAction: {
      'display': 'flex',
      'flexDirection': 'row',
      'justifyContent': 'flex-end',
      '& button:not(:last-child)': {
        marginRight: theme.spacing(),
      },
    },
  }),
);

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
}))(({ classes, header, profile }: TaskInfoCardProps) => {
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
          <Box display="flex">
            <Box mr={2}>
              <Avatar className={classes.avatar} base64={profile.avatar} alt="photo" />
            </Box>
            <Box flex={1}>
              <Paper>
                <List className={classes.list} disablePadding>
                  <ListItem divider>
                    <ListItemText primary={t('phonebook:fields.lastName')} />
                    <ListItemText primary={profile.name} />
                  </ListItem>
                  <ListItem divider>
                    <ListItemText primary={t('phonebook:fields.company')} />
                    <ListItemText primary={profile.company} />
                  </ListItem>
                  <ListItem divider>
                    <ListItemText primary={t('phonebook:fields.department')} />
                    <ListItemText primary={profile.department} />
                  </ListItem>
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
                  </ListItem>
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
  },
  file: {
    padding: 0,
    width: '100%',
    textAlign: 'left',
    borderRadius: '0',
    justifyContent: 'flex-start',
    color: '#3C6AA3',
  },
}))(({ classes, task, loading, handleDownload }: TaskFilesAreaProps) => {
  if (Array.isArray(task?.files) && task.files.length > 0) {
    return (
      <CardActions disableSpacing className={classes.files}>
        {task?.files?.map((file) => (
          <IconButton key={file.id} className={classes.file} size="small" onClick={() => handleDownload(task, file)}>
            <Box display="grid" gridTemplateColumns="20px auto auto">
              <AttachFileIcon style={{ placeSelf: 'center' }} fontSize="small" />
              {loading ? <HourglassFullIcon style={{ placeSelf: 'center' }} fontSize="small" /> : <span />}
              <Typography variant="body1" key={file.id}>
                {file.name}
              </Typography>
            </Box>
          </IconButton>
        ))}
      </CardActions>
    );
  }

  return null;
});

const TaskComponent: FC<TaskComponentProps> = ({
  loading,
  loadingTaskFile,
  loadingComment,
  task,
  comment,
  files,
  setFiles,
  handleDownload,
  handleComment,
  handleAccept,
  handleClose,
}) => {
  const classes = useStyles({});
  const { t, i18n } = useTranslation();

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" alignItems="center" p={1} className={classes.control}>
        <Link href={{ pathname: '/tasks' }} as="/tasks" passHref>
          <IconButton className={classes.controlLeft}>
            <ArrowBackIcon />
          </IconButton>
        </Link>
        <div style={{ width: '100%' }} />
      </Box>
      {!task || loading ? (
        <Loading activate={loading} full type="circular" color="secondary" disableShrink size={48}>
          <Typography className={clsx(classes.cardHeaderTitle, classes.notFound)} variant="h4">
            {t('tasks:task.notFound')}
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
                  <Typography className={classes.cardHeaderTitle} variant="subtitle1">
                    {t('tasks:task.header', {
                      task: task.code,
                      date: dateFormat(task.createdDate, i18n),
                    })}
                  </Typography>
                }
              />
              <CardContent>{task.subject}</CardContent>
            </Card>
            <TaskInfoCard header={t('tasks:headers.author')} profile={task.initiatorUser} />
            <TaskInfoCard header={t('tasks:headers.executor')} profile={task.executorUser} />
            <Card style={{ overflow: 'visible' }}>
              <CardContent className={clsx(classes.cardContent, classes.statusContent)}>
                <Icon base64 src={task.service?.avatar || task.route?.avatar} size={48} />
                <span style={{ placeSelf: 'center stretch' }}>
                  <Typography variant="subtitle1">{task.route?.name}</Typography>
                  <Typography variant="subtitle2">{task.service?.name}</Typography>
                </span>
              </CardContent>
            </Card>
            <Card style={{ overflow: 'visible' }}>
              <CardContent className={clsx(classes.cardContent, classes.statusContent)}>
                <Icon src={getTicketStatusIcon(task.status)} size={48} />
                <span style={{ placeSelf: 'center stretch' }}>{task.status}</span>
              </CardContent>
            </Card>
            <Card className={classes.fullRow}>
              <CardHeader
                disableTypography
                className={clsx(classes.cardHeader, classes.background)}
                title={
                  <Typography className={classes.cardHeaderTitle} variant="subtitle1">
                    {t('tasks:headers.description')}
                  </Typography>
                }
              />
              <CardContent className={classes.body} dangerouslySetInnerHTML={{ __html: task.body ?? '' }} />
              <FilesArea task={task} loading={loadingTaskFile} handleDownload={handleDownload} />
            </Card>
            {/* <Card className={classes.fullRow}>
            <CardHeader
              disableTypography
              className={clsx(classes.cardHeader, classes.background)}
              title={
                <Typography className={classes.cardHeaderTitle} variant="subtitle1">
                  {t('tasks:headers.comments')}
                </Typography>
              }
            />
            <CardContent>
              <Iframe srcDoc={task.body} />
            </CardContent>
            </Card>*/}
            {/* task.status !== 'Завершен' && (
              <Loading activate={loading} full wrapperClasses={classes.fullRow} type="circular" color="secondary" disableShrink size={48}>
                <FormControl className={clsx(classes.fullRow, classes.formControl)} variant="outlined">
                  <TextField
                    value={comment}
                    onChange={handleComment}
                    multiline
                    rows={5}
                    type="text"
                    color="secondary"
                    label={t('tasks:comment.add')}
                    variant="outlined"
                  />
                </FormControl>
                <FormControl className={clsx(classes.fullRow, classes.formControl)} variant="outlined">
                  <Dropzone files={files} setFiles={setFiles} color="secondary" />
                </FormControl>
                <FormControl className={clsx(classes.fullRow, classes.formControl, classes.formAction)}>
                  <Button actionType="cancel" onClick={handleClose}>
                    {t('common:cancel')}
                  </Button>
                  <Button disabled onClick={handleAccept}>
                    {t('common:send')}
                  </Button>
            </FormControl>
            </Loading>*/}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default TaskComponent;
