/** @format */

//#region Imports NPM
import React, { FC } from 'react';
import { useRouter } from 'next/router';
import { Breadcrumbs } from '@material-ui/core';
import { emphasize, Theme, withStyles } from '@material-ui/core/styles';
import HomeIcon from '@material-ui/icons/Home';
import Chip from '@material-ui/core/Chip';
//#endregion
//#region Imports Local
import { FilesBreadcrumbsProps } from '@lib/types';
import { useTranslation } from '@lib/i18n-client';
import { FilesBreadcrumbsLast } from './breadcrumbs-last';
//#endregion

const StyledBreadcrumb = withStyles((theme: Theme) => ({
  root: {
    'backgroundColor': theme.palette.grey[100],
    'height': theme.spacing(3),
    'color': theme.palette.grey[800],
    'fontWeight': theme.typography.fontWeightRegular,
    'padding': '20px 5px 20px 5px',
    'fontSize': '1.1rem',
    '&:hover, &:focus': {
      backgroundColor: theme.palette.grey[300],
    },
    '&:active': {
      boxShadow: theme.shadows[1],
      backgroundColor: emphasize(theme.palette.grey[300], 0.12),
    },
  },
}))(Chip) as typeof Chip;

export const FilesBreadcrumbs: FC<FilesBreadcrumbsProps> = ({
  path,
  handleFolder,
  handleUpload,
  handleDelete,
  handleUrl,
}) => {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <Breadcrumbs aria-label="breadcrumbs">
      {path.map((element, index) => {
        const current = path.reduce(
          (accumulator, value, currentIndex) =>
            currentIndex > index || !value ? accumulator : `${accumulator}${value}/`,
          '/',
        );
        return (
          <StyledBreadcrumb
            key={element || 'home'}
            component="a"
            href={`${router.route}${current}`}
            label={element || t('files:home')}
            icon={element ? undefined : <HomeIcon fontSize="small" />}
            onClick={(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
              event.preventDefault();
              handleFolder(`${path.slice(0, index + 1).join('/')}/`);
            }}
          />
        );
      })}
      <FilesBreadcrumbsLast handleUpload={handleUpload} handleDelete={handleDelete} handleUrl={handleUrl} />
    </Breadcrumbs>
  );
};
