/** @format */

//#region Imports NPM
import React, { FC } from 'react';
import { ButtonGroup, TextField, Grid } from '@material-ui/core';
import DateFnsUtils from '@date-io/date-fns';
import { DateTimePicker, LocalizationProvider } from '@material-ui/pickers';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
//#endregion
//#region Imports Local
import { useTranslation } from '@lib/i18n-client';
import { dateLocale } from '@lib/locales';
import type { DocFlowProcessStepProps } from '@lib/types/docflow';
import { DocFlowProcessStep } from '@lib/types/docflow';
import BaseButton from '@front/components/ui/button';
//#endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    date: {},
  }),
);

const DocFlowProcessStepButtons: FC<DocFlowProcessStepProps> = ({ loading, endDate, handleEndDate, handleProcessStep, task }) => {
  const classes = useStyles({});
  const { i18n, t } = useTranslation();
  const locale = dateLocale(i18n.language);

  switch (task.businessProcessStep) {
    case DocFlowProcessStep.Approve:
      return (
        <Grid container spacing={3}>
          <Grid item>
            <BaseButton fullHeight disabled={loading} actionType="accept" onClick={() => handleProcessStep(DocFlowProcessStep.Approve)}>
              {t('docflow:processStep:approve')}
            </BaseButton>
          </Grid>
          <Grid item>
            <BaseButton fullHeight disabled={loading} actionType="accept" onClick={() => handleProcessStep(DocFlowProcessStep.NotApprove)}>
              {t('docflow:processStep:notApprove')}
            </BaseButton>
          </Grid>
        </Grid>
      );

    case DocFlowProcessStep.Conform:
      return (
        <Grid container spacing={3}>
          <Grid item>
            <BaseButton fullHeight disabled={loading} actionType="accept" onClick={() => handleProcessStep(DocFlowProcessStep.Conform)}>
              {t('docflow:processStep:conform')}
            </BaseButton>
          </Grid>
          <Grid item>
            <BaseButton fullHeight disabled={loading} actionType="accept" onClick={() => handleProcessStep(DocFlowProcessStep.NotConform)}>
              {t('docflow:processStep:notConform')}
            </BaseButton>
          </Grid>
        </Grid>
      );
    case DocFlowProcessStep.Execute:
      return (
        <Grid container spacing={3}>
          <Grid item>
            <BaseButton fullHeight disabled={loading} actionType="accept" onClick={() => handleProcessStep(DocFlowProcessStep.Execute)}>
              {t('docflow:processStep:execute')}
            </BaseButton>
          </Grid>
        </Grid>
      );
    case DocFlowProcessStep.CheckExecute:
      return (
        <Grid container spacing={3}>
          <Grid item>
            <BaseButton fullHeight disabled={loading} actionType="accept" onClick={() => handleProcessStep(DocFlowProcessStep.Conform)}>
              {t('docflow:processStep:checkExecuteTrue')}
            </BaseButton>
          </Grid>
          <Grid item>
            <BaseButton fullHeight disabled={loading} actionType="accept" onClick={() => handleProcessStep(DocFlowProcessStep.NotConform)}>
              {t('docflow:processStep:checkExecuteFalse')}
            </BaseButton>
          </Grid>
        </Grid>
      );

    case DocFlowProcessStep.CheckFamiliarize:
      return (
        <Grid container spacing={3}>
          <Grid item>
            <BaseButton
              fullHeight
              disabled={loading}
              actionType="accept"
              onClick={() => handleProcessStep(DocFlowProcessStep.CheckFamiliarize)}
            >
              {t('docflow:processStep:checkFamiliarize')}
            </BaseButton>
          </Grid>
        </Grid>
      );
    case DocFlowProcessStep.Familiarize:
      return (
        <Grid container spacing={3}>
          <Grid item>
            <ButtonGroup style={{ height: '100%' }} color="primary">
              <BaseButton
                fullHeight
                disabled={loading}
                actionType="accept"
                onClick={() => handleProcessStep(DocFlowProcessStep.Familiarize)}
              >
                {t('docflow:processStep:familiarize')}
              </BaseButton>
            </ButtonGroup>
          </Grid>
          {handleEndDate && (
            <Grid item>
              <LocalizationProvider dateAdapter={DateFnsUtils} locale={locale}>
                <DateTimePicker
                  renderInput={(props) => <TextField {...props} variant="outlined" helperText={null} color="secondary" />}
                  disabled={loading}
                  clearable
                  disableFuture
                  label={t('docflow:headers.endDate')}
                  value={endDate}
                  onChange={handleEndDate}
                />
              </LocalizationProvider>
            </Grid>
          )}
        </Grid>
      );
    default:
  }

  return null;
};

export default DocFlowProcessStepButtons;
