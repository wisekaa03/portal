/** @format */

//#region Imports NPM
import React, { FC, useRef } from 'react';
import Link from 'next/link';
import { Theme, fade, makeStyles, createStyles, withStyles } from '@material-ui/core/styles';
import { Box, InputBase, Card, CardActionArea, CardContent, Typography, Divider } from '@material-ui/core';
// import SearchIcon from '@material-ui/icons/Search';
import clsx from 'clsx';
//#endregion
//#region Imports Local
import dateFormat from '@lib/date-format';
import { useTranslation } from '@lib/i18n-client';
// import { TASK_STATUSES } from '@lib/constants';
import BoxWithRef from '@lib/box-ref';
import type { TasksComponentProps, TasksCardProps } from '@lib/types';
import { Icon } from '@front/components/ui/icon';
// import Select from '@front/components/ui/select';
import Loading from '@front/components/loading';
// import RefreshButton from '@front/components/ui/refresh-button';
// import TaskPage from '@front/pages/task';
//#endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    search: {
      'position': 'relative',
      'backgroundColor': fade(theme.palette.common.white, 0.15),
      'width': '100%',
      'borderRadius': theme.shape.borderRadius,
      'border': `1px solid ${theme.palette.secondary.main}`,
      '&:hover': {
        backgroundColor: fade(theme.palette.common.white, 0.25),
      },
      [theme.breakpoints.up('sm')]: {
        width: 'auto',
      },
    },
    searchIcon: {
      width: theme.spacing(7),
      height: '100%',
      position: 'absolute',
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: theme.palette.secondary.main,
    },
    inputRoot: {
      height: '100%',
    },
    inputInput: {
      padding: theme.spacing(1, 1, 1, 7),
      transition: theme.transitions.create('width'),
      width: '100%',
      color: theme.palette.secondary.main,
      [theme.breakpoints.up('sm')]: {
        width: 200,
      },
    },
    iconButton: {
      padding: theme.spacing(0.5),
      color: theme.palette.secondary.main,
    },
    notFounds: {
      color: '#949494',
    },
  }),
);

const TasksCard = withStyles((theme) => ({
  root: {
    'height': 'fit-content',
    'display': 'flex',
    'flexDirection': 'column',
    'justifyContent': 'flex-start',
    'alignItems': 'stretch',
    'flex': 1,
    // 'minWidth': 344,
    'maxWidth': 344,
    'borderRadius': theme.shape.borderRadius,
    'background': fade(theme.palette.secondary.main, 0.15),
    'marginRight': theme.spacing(2),
    'marginBottom': theme.spacing(2),
    '& > button': {
      height: '100%',
    },
  },
  content: {
    'height': '100%',
    'padding': theme.spacing(2),
    'display': 'grid',
    'flexDirection': 'column',
    'justifyContent': 'flex-start',
    'alignItems': 'stretch',
    'gridTemplateRows': '1fr min-content min-content',
    '& > hr': {
      marginTop: theme.spacing(),
      marginBottom: theme.spacing(),
    },
  },
  label: {
    'display': 'grid',
    'gridTemplateColumns': '1fr 4fr',
    'gridTemplateRows': '50px 1fr',
    'gap': `${theme.spacing()}px`,
    'maxHeight': '180px',
    'minHeight': '50px',
    'overflow': 'hidden',
    '& h6': {
      maxWidth: 254,
    },
    '& > div:last-child': {
      gridColumnStart: 1,
      gridColumnEnd: 3,
    },
  },
  registered: {
    color: '#b99d15',
  },
  worked: {
    color: '#3aad0b',
  },
}))(({ classes, task }: TasksCardProps) => {
  const { t, i18n } = useTranslation();
  const { where, code: id, service, subject, body, smallBody, status, createdDate } = task;

  return (
    <Card className={classes.root}>
      <CardActionArea>
        <Link href={{ pathname: '/task', query: { where, code: id } }} as={`/task/${where}/${id}`}>
          <CardContent className={classes.content}>
            <div className={classes.label}>
              <div>
                <Icon base64 src={service?.avatar} size={36} />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <Typography variant="subtitle2">{subject}</Typography>
              </div>
              <div>
                <Typography variant="body1" dangerouslySetInnerHTML={{ __html: body || '' }} />
              </div>
            </div>
            <Divider />
            <Box display="flex" flexDirection="column" color="gray">
              <span>
                {t('tasks:status')}:{' '}
                <span
                  className={clsx({
                    [classes.registered]: status !== 'В работе',
                    [classes.worked]: status === 'В работе',
                  })}
                >
                  {status}
                </span>
              </span>
              <span>{t('tasks:date', { value: dateFormat(createdDate, i18n) })}</span>
              <span>{t('tasks:id', { value: id })}</span>
            </Box>
          </CardContent>
        </Link>
      </CardActionArea>
    </Card>
  );
});

const TasksComponent: FC<TasksComponentProps> = ({ loading, tasks, status, search, refetchTasks, handleSearch, handleStatus }) => {
  const classes = useStyles({});
  const { t } = useTranslation();
  const ticketBox = useRef(null);

  const maxHeight = ticketBox.current ? `calc(100vh - ${(ticketBox.current as any)?.offsetTop}px)` : '100%';

  return (
    <Box display="flex" flexDirection="column" flexGrow={1} px={2}>
      {/* <Box display="flex" mb={1}>
        <div className={classes.search}>
          <div className={classes.searchIcon}>
            <SearchIcon />
          </div>
          <InputBase
            onChange={handleSearch}
            value={search}
            placeholder={t('tasks:searchPlaceholder')}
            classes={{
              input: classes.inputInput,
              root: classes.inputRoot,
            }}
            inputProps={{ 'aria-label': 'search' }}
          />
        </div>
        <Box display="flex" justifyContent="center" alignItems="center" flexGrow={1} px={1}>
          <Typography color="secondary" variant="h4">
            {t('tasks:title')}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="flex-end" alignItems="center" mr={1} position="relative">
          <RefreshButton noAbsolute onClick={() => refetchTasks()} />
        </Box>
        <Box display="flex" justifyContent="flex-end">
          <Select label={t('tasks:status')} items={TASK_STATUSES} value={status} onChange={handleStatus} />
        </Box>
          </Box> */}
      <BoxWithRef
        ref={ticketBox}
        overflow="auto"
        style={{ maxHeight }}
        display="flex"
        flexGrow={1}
        flexWrap="wrap"
        my={2}
        alignItems="stretch"
        justifyContent="flex-start"
      >
        <Loading activate={loading} full type="circular" color="secondary" disableShrink size={48}>
          {tasks.length > 0 ? (
            tasks.map((task) => task && <TasksCard key={task.code} task={task} />)
          ) : (
            <Typography className={classes.notFounds} variant="h4">
              {t('tasks:notFounds')}
            </Typography>
          )}
        </Loading>
      </BoxWithRef>
    </Box>
  );
};

export default TasksComponent;