/** @format */

// #region Imports NPM
import React from 'react';
import { fade, Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { Typography, TextField, InputBase } from '@material-ui/core';
import MuiTreeView from '@material-ui/lab/TreeView';
import MuiTreeItem, { TreeItemProps as MuiTreeItemProps } from '@material-ui/lab/TreeItem';
import DirectoryIcon from '@material-ui/icons/Folder';
import AddIcon from '@material-ui/icons/AddCircleOutlineRounded';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import clsx from 'clsx';
// import DirectorySharedIcon from '@material-ui/icons/FolderShared';
// import FileIcon from '@material-ui/icons/Note';
// #endregion
// #region Imports Local
// #endregion

type TreeItemProps = MuiTreeItemProps & {
  labelInfo?: string;
  createItem?: string;
  handleCreateItem?: React.Dispatch<React.SetStateAction<string>>;
  labelText: string;
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      'color': theme.palette.secondary.main,
      '&$selected:focus > $content $label, &$selected > $content $label:hover': {
        backgroundColor: 'unset',
      },
      '&:focus > $content:not($action)': {
        backgroundColor: fade(theme.palette.secondary.main, 0.9),
        color: '#fff',
      },
      '&$selected > $content $label': {
        backgroundColor: 'inherit',
      },
    },
    selected: {},
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
    action: {},
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
    labelIcon: {
      marginRight: theme.spacing(),
    },
    labelText: {
      fontWeight: 'inherit',
      flexGrow: 1,
    },
    input: {
      color: theme.palette.secondary.main,
      fontSize: '.875rem',
    },
  }),
);

export const TreeItem = ({
  labelText,
  labelInfo,
  createItem,
  handleCreateItem,
  ...rest
}: TreeItemProps): React.ReactElement => {
  const classes = useStyles({});

  const action = createItem !== undefined;

  const handleChangeItem = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    handleCreateItem(event.currentTarget.value);
  };

  return (
    <MuiTreeItem
      label={
        <div className={classes.labelRoot}>
          {action ? (
            <>
              <AddIcon color="inherit" className={classes.labelIcon} />
              <InputBase
                color="secondary"
                value={createItem}
                onChange={handleChangeItem}
                placeholder={labelText}
                className={classes.input}
              />
            </>
          ) : (
            <>
              <DirectoryIcon color="inherit" className={classes.labelIcon} />
              <Typography variant="body2" className={classes.labelText}>
                {labelText}
              </Typography>
              {labelInfo && (
                <Typography variant="caption" color="inherit">
                  {labelInfo}
                </Typography>
              )}
            </>
          )}
        </div>
      }
      classes={{
        root: classes.root,
        content: clsx(classes.content, { [classes.action]: action }),
        expanded: classes.expanded,
        group: classes.group,
        label: classes.label,
        selected: classes.selected,
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
