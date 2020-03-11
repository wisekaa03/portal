/** @format */

// #region Imports NPM
import React, { useState } from 'react';
import { fade, Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { Typography, InputBase } from '@material-ui/core';
import MuiTreeView from '@material-ui/lab/TreeView';
import MuiTreeItem from '@material-ui/lab/TreeItem';
import DirectoryIcon from '@material-ui/icons/Folder';
import AddIcon from '@material-ui/icons/AddCircleOutlineRounded';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
// #endregion
// #region Imports Local
import { TreeItemDefaultProps, TreeItemCreatorProps, TreeViewProps, TreeItemProps } from './types';
// #endregion

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
  }),
);

const useStylesDefault = makeStyles((theme: Theme) =>
  createStyles({
    icon: {
      marginRight: theme.spacing(),
    },
    text: {
      fontWeight: 'inherit',
      flexGrow: 1,
    },
  }),
);

const useStylesCreator = makeStyles((theme: Theme) =>
  createStyles({
    icon: {
      marginRight: theme.spacing(),
    },
    input: {
      color: theme.palette.secondary.main,
      fontSize: '.875rem',
    },
  }),
);

export const TreeItemDefault = ({ labelText, labelInfo, ...rest }: TreeItemDefaultProps): React.ReactElement => {
  const classes = useStylesDefault({});

  return (
    <TreeItem
      label={
        <>
          <DirectoryIcon color="inherit" className={classes.icon} />
          <Typography variant="body2" className={classes.text}>
            {labelText}
          </Typography>
          {labelInfo && (
            <Typography variant="caption" color="inherit">
              {labelInfo}
            </Typography>
          )}
        </>
      }
      {...rest}
    />
  );
};

export const TreeItemCreator = ({
  labelText,
  handleCreate,
  nodeId,
  ...rest
}: TreeItemCreatorProps): React.ReactElement => {
  const classes = useStylesCreator({});

  const [value, setValue] = useState<string>('');

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    if (event.keyCode === 13) {
      // TODO: элемент создающий новую папку имеет nodeId вида '/${parentNodeName}' (слеш вначале)
      const pathname = value ? `${nodeId.substring(1)}${value.trim()}` : '';

      if (pathname) {
        handleCreate(pathname);
        setValue('');
      }
    }
  };

  const handleChangeItem = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    setValue(event.currentTarget.value);
  };

  return (
    <TreeItem
      nodeId={nodeId}
      label={
        <>
          <AddIcon color="inherit" className={classes.icon} />
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
      }
      {...rest}
    />
  );
};

const TreeItem = ({ label, depth = 0, ...rest }: TreeItemProps): React.ReactElement => {
  const classes = useStyles({});

  return (
    <MuiTreeItem
      label={<div className={classes.labelRoot}>{label}</div>}
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
