/** @format */

//#region Imports NPM
import React, { FC } from 'react';
import { ButtonGroup, TextField, Grid } from '@material-ui/core';
import DateFnsUtils from '@date-io/date-fns';
import { DateTimePicker, LocalizationProvider } from '@material-ui/lab';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
//#endregion
//#region Imports Local
import { useTranslation } from '@lib/i18n-client';
import { dateLocale } from '@lib/locales';
import { DocFlowProcessStep, DocFlowProcessStepProps } from '@lib/types/docflow';
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

  switch (task.processStep) {
    case DocFlowProcessStep.Execute:
      return (
        <Grid container spacing={3}>
          <Grid item>
            <BaseButton disabled={loading} actionType="accept" onClick={() => handleProcessStep(DocFlowProcessStep.Execute)}>
              {t('docflow:processStep:execute')}
            </BaseButton>
          </Grid>
        </Grid>
      );
    case DocFlowProcessStep.Familiarize:
      return (
        <Grid container spacing={3}>
          <Grid item>
            <ButtonGroup color="primary">
              <BaseButton disabled={loading} actionType="accept" onClick={() => handleProcessStep(DocFlowProcessStep.Familiarize)}>
                {t('docflow:processStep:familiarize')}
              </BaseButton>
            </ButtonGroup>
          </Grid>
          {handleEndDate && (
            <Grid item>
              <LocalizationProvider dateAdapter={DateFnsUtils} locale={locale}>
                <DateTimePicker
                  renderInput={(props) => <TextField variant="outlined" helperText={null} color="secondary" {...props} />}
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
