/** @format */
/* eslint no-use-before-define:0 */

//#region Imports NPM
import React from 'react';
import { Box, Fab, Menu, MenuProps, MenuItem, Paper, Button, ListItemIcon, ListItemText } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import BackupIcon from '@material-ui/icons/Backup';
import DeleteIcon from '@material-ui/icons/Delete';
import CloudIcon from '@material-ui/icons/Cloud';
//#endregion
//#region Imports Local
import type { FilesBreadcrumbsLastProps } from '@lib/types';
import { useTranslation } from '@lib/i18n-client';
//#endregion

const StyledMenu = withStyles({
  paper: {
    border: '1px solid #d3d4d5',
  },
})((props: MenuProps) => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'center',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'center',
    }}
    {...props}
  />
));

const StyledMenuItem = withStyles((theme) => ({
  root: {
    '&:focus': {
      'backgroundColor': '#6AA7C8',
      '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
        color: theme.palette.common.white,
      },
    },
  },
}))(MenuItem);

export const FilesBreadcrumbsLast: React.FC<FilesBreadcrumbsLastProps> = ({ handleUpload, handleDelete, handleUrl }) => {
  const { t } = useTranslation();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Fab size="small" color="primary" aria-label="add" key="files-additional" style={{ color: '#fff' }} onClick={handleClick}>
        <AddIcon />
      </Fab>
      <StyledMenu id="customized-menu" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
        <StyledMenuItem onClick={handleUpload}>
          <ListItemIcon>
            <BackupIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t('files:upload')} />
        </StyledMenuItem>
        <StyledMenuItem disabled onClick={() => handleDelete()}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t('files:delete')} />
        </StyledMenuItem>
        <StyledMenuItem onClick={handleUrl}>
          <ListItemIcon>
            <CloudIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t('files:url')} />
        </StyledMenuItem>
      </StyledMenu>
    </>
  );
};
