/** @format */

// #region Imports NPM
import React from 'react';
import { fade, Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import MuiTreeView from '@material-ui/lab/TreeView';
import MuiTreeItem, { TreeItemProps as MuiTreeItemProps } from '@material-ui/lab/TreeItem';
import DirectoryIcon from '@material-ui/icons/Folder';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
// import DirectorySharedIcon from '@material-ui/icons/FolderShared';
// import FileIcon from '@material-ui/icons/Note';
// #endregion
// #region Imports Local
// #endregion

type TreeItemProps = MuiTreeItemProps & {
  labelInfo?: string;
  labelText: string;
};

const useTreeItemStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      'color': theme.palette.secondary.main,
      '&:focus > $content': {
        backgroundColor: fade(theme.palette.secondary.main, 0.9),
        color: '#fff',
      },
    },
    content: {
      'color': theme.palette.secondary.main,
      'borderTopRightRadius': theme.spacing(2),
      'borderBottomRightRadius': theme.spacing(2),
      'paddingRight': theme.spacing(),
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
      fontWeight: 'inherit',
      color: 'inherit',
    },
    labelRoot: {
      display: 'flex',
      alignItems: 'center',
      padding: theme.spacing(0.5, 0),
    },
    labelIcon: {
      marginRight: theme.spacing(),
    },
    labelText: {
      fontWeight: 'inherit',
      flexGrow: 1,
    },
  }),
);

export const TreeItem = (props: TreeItemProps): React.ReactElement => {
  const classes = useTreeItemStyles();
  const { labelText, labelInfo, ...rest } = props;

  return (
    <MuiTreeItem
      label={
        <div className={classes.labelRoot}>
          <DirectoryIcon color="inherit" className={classes.labelIcon} />
          <Typography variant="body2" className={classes.labelText}>
            {labelText}
          </Typography>
          {labelInfo && (
            <Typography variant="caption" color="inherit">
              {labelInfo}
            </Typography>
          )}
        </div>
      }
      classes={{
        root: classes.root,
        content: classes.content,
        expanded: classes.expanded,
        group: classes.group,
        label: classes.label,
      }}
      {...rest}
    />
  );
};

export const TreeView = ({ children }): React.ReactElement => {
  return (
    <MuiTreeView
      defaultCollapseIcon={<ArrowDropDownIcon />}
      defaultExpandIcon={<ArrowRightIcon />}
      defaultEndIcon={<div style={{ width: 24 }} />}
    >
      {children}
    </MuiTreeView>
  );
};
