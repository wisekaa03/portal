/** @format */

//#region Imports NPM
import React, { FC, useRef } from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import filesize from 'filesize';
import { TFunction, I18n } from 'next-i18next';
import { ButtonGroup, TextField } from '@material-ui/core';
import { Theme, fade, darken, makeStyles, createStyles, withStyles } from '@material-ui/core/styles';
//#endregion
//#region Imports Local
import { useTranslation } from '@lib/i18n-client';
import { DocFlowProcessStep, DocFlowProcessStepProps } from '@lib/types/docflow';
import BaseButton from '@front/components/ui/button';
//#endregion

const useStyles = makeStyles((theme: Theme) => createStyles({}));

const DocFlowProcessStepButtons: FC<DocFlowProcessStepProps> = ({ loading, task, handleProcessStep }) => {
  const classes = useStyles({});
  const { i18n, t } = useTranslation();

  switch (task.processStep) {
    case DocFlowProcessStep.Execute:
      return (
        <>
          <BaseButton disabled={loading} actionType="accept" onClick={() => handleProcessStep(DocFlowProcessStep.Execute)}>
            {t('docflow:processStep:execute')}
          </BaseButton>
        </>
      );
    case DocFlowProcessStep.Familiarize:
      return (
        <>
          <ButtonGroup color="primary">
            <BaseButton disabled={loading} actionType="accept" onClick={() => handleProcessStep(DocFlowProcessStep.Familiarize)}>
              {t('docflow:processStep:familiarize')}
            </BaseButton>
          </ButtonGroup>
        </>
      );
    default:
  }

  return null;
};

export default DocFlowProcessStepButtons;
