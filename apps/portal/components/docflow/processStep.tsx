/** @format */

//#region Imports NPM
import React, { FC } from 'react';
import { ButtonGroup } from '@material-ui/core';
//#endregion
//#region Imports Local
import { useTranslation } from '@lib/i18n-client';
import { DocFlowProcessStep, DocFlowProcessStepProps } from '@lib/types/docflow';
import BaseButton from '@front/components/ui/button';
//#endregion

const DocFlowProcessStepButtons: FC<DocFlowProcessStepProps> = ({ loading, task, handleProcessStep }) => {
  const { t } = useTranslation();

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
