/** @format */

// #region Imports NPM
import React, { useState } from 'react';
import { fade, Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { Typography, InputBase } from '@material-ui/core';
import MuiTreeView, { TreeViewProps as MuiTreeViewProps } from '@material-ui/lab/TreeView';
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
  pathname?: string;
  handleCreate?: (_: string) => void;
  labelText: string;
  depth?: number;
};

type TreeViewProps = MuiTreeViewProps & {
  selected: string;
  setSelected: React.Dispatch<React.SetStateAction<string>>;
};

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
      // '&:focus > $content:not($action)': {
      //   backgroundColor: fade(theme.palette.secondary.main, 0.9),
      //   color: '#fff',
      // },
      '&:focus > $content $label': {
        backgroundColor: 'unset',
      },
    },
    selected: {},
    content: {
      'color': theme.palette.secondary.main,
      'borderTopRightRadius': theme.spacing(2),
      'borderBottomRightRadius': theme.spacing(2),
      // 'paddingRight': theme.spacing(),
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
    parentNode: {
      '& ul li $content': {
        paddingLeft: `calc(var(--node-depth) * ${theme.spacing(2)}px)`,
      },
    },
  }),
);

export const TreeItem = ({
  labelText,
  labelInfo,
  handleCreate,
  depth = 0,
  ...rest
}: TreeItemProps): React.ReactElement => {
  const classes = useStyles({});

  const [value, setValue] = useState<string>('');

  const action = handleCreate !== undefined;

  const handleChangeItem = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    setValue(event.currentTarget.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    if (event.keyCode === 13) {
      // TODO: элемент создающий новую папку имеет nodeId вида '/${parentNodeName}' (слеш вначале)
      const { nodeId } = rest;
      const pathname = value ? `${nodeId.substring(1)}${value.trim()}` : '';

      if (pathname) {
        handleCreate(pathname);
        setValue('');
      }
    }
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
                value={value}
                onClick={(event) => event.stopPropagation()}
                onKeyDown={handleKeyDown}
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
      style={
        {
          '--node-depth': depth,
        } as any
      }
      className={rest.children ? classes.parentNode : undefined}
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

export const TreeView = ({ selected, setSelected, children }: TreeViewProps): React.ReactElement => {
  const handleSelected = (_: React.ChangeEvent<{}>, nodeIds: string): void => {
    // TODO: ноды с двумя слешами - инпуты для создания каталога, выделять не нужно
    if (!nodeIds.includes('//')) {
      setSelected(nodeIds);
    }
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
