/** @format */

//#region Imports NPM
import React from 'react';
import { fade, Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { Typography, IconButton, Box, Tooltip } from '@material-ui/core';
import MuiTreeView from '@material-ui/lab/TreeView';
import MuiTreeItem from '@material-ui/lab/TreeItem';
import DirectoryIcon from '@material-ui/icons/FolderRounded';
import EditIcon from '@material-ui/icons/EditRounded';
import DeleteIcon from '@material-ui/icons/DeleteRounded';
import AddIcon from '@material-ui/icons/AddCircleOutlineRounded';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
//#endregion
//#region Imports Local
import { useTranslation } from '@lib/i18n-client';
import { TreeViewProps, TreeItemProps } from '@lib/types';
//#endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      'color': theme.palette.secondary.main,
      '&$selected:focus > $content $label, &$selected > $content $label, &$selected > $content $label:hover': {
        borderTopRightRadius: theme.spacing(2),
        borderBottomRightRadius: theme.spacing(2),
        backgroundColor: fade(theme.palette.secondary.main, 0.9),
        color: '#fff',
      },
      '&:focus > $content $label': {
        backgroundColor: 'unset',
      },
    },
    selected: {},
    content: {
      'color': theme.palette.secondary.main,
      'borderTopRightRadius': theme.spacing(2),
      'borderBottomRightRadius': theme.spacing(2),
      'fontWeight': theme.typography.fontWeightMedium,
      '$expanded > &': {
        fontWeight: theme.typography.fontWeightRegular,
      },
      '&:hover': {
        backgroundColor: fade(theme.palette.secondary.main, 0.2),
      },
    },
    group: {
      'marginLeft': 0,
      '& $content': {
        paddingLeft: theme.spacing(2),
      },
    },
    expanded: {},
    label: {
      'fontWeight': 'inherit',
      'color': 'inherit',
      '&:hover': {
        backgroundColor: 'unset',
      },
    },
    labelRoot: {
      display: 'flex',
      alignItems: 'center',
      padding: theme.spacing(0.5, 0),
    },
    parentNode: {
      '& ul li $content': {
        paddingLeft: `calc(var(--node-depth) * ${theme.spacing(2)}px)`,
      },
    },
    icon: {
      marginRight: theme.spacing(),
    },
    text: {
      flexGrow: 1,
    },
    action: {
      padding: 0,
      marginRight: theme.spacing(),
    },
  }),
);

export const TreeItem = ({
  labelText,
  id,
  active,
  parent,
  nodeId,
  handleEdit,
  depth = 0,
  ...rest
}: TreeItemProps): React.ReactElement => {
  const classes = useStyles({});
  const { t } = useTranslation();

  const handleEditItem = (type: number) => (event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    event.stopPropagation();

    handleEdit(nodeId, type, id);
  };

  return (
    <MuiTreeItem
      nodeId={nodeId}
      label={
        <div className={classes.labelRoot}>
          <DirectoryIcon color="inherit" className={classes.icon} />
          <Typography variant="body2" className={classes.text}>
            {labelText}
          </Typography>
          {active && (
            <Box mr={1}>
              <Tooltip title={t('files:addFolder')} enterDelay={1000}>
                <IconButton className={classes.action} size="small" onClick={handleEditItem(1)}>
                  <AddIcon />
                </IconButton>
              </Tooltip>
              {!!id && (
                <>
                  <Tooltip title={t('files:editFolder')} enterDelay={1000}>
                    <IconButton className={classes.action} size="small" onClick={handleEditItem(2)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  {!parent && (
                    <Tooltip title={t('files:deleteFolder')} enterDelay={1000}>
                      <IconButton className={classes.action} size="small" onClick={handleEditItem(3)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </>
              )}
            </Box>
          )}
        </div>
      }
      style={
        {
          '--node-depth': depth,
        } as any
      }
      className={rest.children ? classes.parentNode : undefined}
      classes={{
        root: classes.root,
        content: classes.content,
        expanded: classes.expanded,
        group: classes.group,
        label: classes.label,
        selected: classes.selected,
      }}
      {...rest}
    />
  );
};

export const TreeView = ({ selected, setSelected, children }: TreeViewProps): React.ReactElement => {
  const handleSelected = (_: React.ChangeEvent<{}>, nodeIds: string): void => {
    setSelected(nodeIds);
  };

  return (
    <MuiTreeView
      selected={selected}
      onNodeSelect={handleSelected}
      defaultCollapseIcon={<ArrowDropDownIcon />}
      defaultExpandIcon={<ArrowRightIcon />}
      defaultEndIcon={<div style={{ width: 24 }} />}
    >
      {children}
    </MuiTreeView>
  );
};
