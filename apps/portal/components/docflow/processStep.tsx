/** @format */

//#region Imports NPM
import React, { FC, useRef } from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import filesize from 'filesize';
import { TFunction, I18n } from 'next-i18next';
import { Theme, fade, darken, makeStyles, createStyles, withStyles } from '@material-ui/core/styles';
//#endregion
//#region Imports Local
import { useTranslation } from '@lib/i18n-client';
import { DocFlowProcessStepProps } from '@lib/types/docflow';
import BaseButton from '@front/components/ui/button';
//#endregion

const useStyles = makeStyles((theme: Theme) => createStyles({}));

const DocFlowProcessStepButtons: FC<DocFlowProcessStepProps> = ({ loading, task }) => {
  const classes = useStyles({});
  const { i18n, t } = useTranslation();

  return null;
};

export default DocFlowProcessStepButtons;
