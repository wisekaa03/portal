/** @format */

//#region Imports NPM
import React, { FC, useRef } from 'react';
import { Theme, fade, makeStyles, createStyles, withStyles } from '@material-ui/core/styles';
import { Box, InputBase, Card, CardActionArea, CardContent, Typography, Divider } from '@material-ui/core';
//#endregion
//#region Imports Local
import { useTranslation } from '@lib/i18n-client';
import type { DocFlowTasksComponentProps } from '@lib/types/docflow';
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

const DocFlowTasksComponent: FC<DocFlowTasksComponentProps> = ({ loading, tasks, status, find, handleSearch, handleStatus }) => {
  const classes = useStyles({});
  const { t } = useTranslation();
  const ticketBox = useRef(null);

  const maxHeight = ticketBox.current ? `calc(100vh - ${(ticketBox.current as any)?.offsetTop}px)` : '100%';

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" alignItems="center" p={1} className={classes.control}>
        <Search value={find} handleChange={handleSearch} />
      </Box>
      <BoxWithRef
        ref={ticketBox}
        overflow="auto"
        style={{ maxHeight }}
        display="flex"
        flexGrow={1}
        flexWrap="wrap"
        my={2}
        marginTop="0"
        marginBottom="0"
        padding="16px 0 0 16px"
        alignItems="stretch"
        justifyContent="flex-start"
        alignContent="flex-start"
      >
        <Loading activate={loading} full type="circular" color="secondary" disableShrink size={48}>
          {tasks.length > 0 ? null : ( // tasks.map((task) => task && <TasksCard key={`${task.where}.${task.code}`} task={task} />)
            <Typography className={classes.notFounds} variant="h4">
              {t('docflow:task.notFounds')}
            </Typography>
          )}
        </Loading>
      </BoxWithRef>
    </Box>
  );
};

export default DocFlowTasksComponent;
