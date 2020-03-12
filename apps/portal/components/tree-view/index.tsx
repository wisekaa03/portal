/** @format */

// #region Imports NPM
import React, { useState } from 'react';
import { fade, Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { useMutation } from '@apollo/react-hooks';
import {
  Typography,
  TextField,
  IconButton,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@material-ui/core';
import MuiTreeView from '@material-ui/lab/TreeView';
import MuiTreeItem from '@material-ui/lab/TreeItem';
import DirectoryIcon from '@material-ui/icons/FolderRounded';
import EditIcon from '@material-ui/icons/EditRounded';
import DeleteIcon from '@material-ui/icons/DeleteRounded';
import AddIcon from '@material-ui/icons/AddCircleOutlineRounded';
import DoneIcon from '@material-ui/icons/DoneRounded';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
// #endregion
// #region Imports Local
import { TreeViewProps, TreeItemProps } from './types';
import { FILE, EDIT_FILE, DELETE_FILE, EDIT_FOLDER, FOLDER, DELETE_FOLDER } from '../../lib/queries';
import { FILES_SHARED_NAME } from '../../lib/constants';
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

// export const TreeItemCreator = ({ labelText, nodeId, ...rest }: TreeItemCreatorProps): React.ReactElement => {
//   const classes = useStylesCreator({});

//   const [value, setValue] = useState<string>('');
//   const ifValid = value.length > 3;

//   const [editFolder] = useMutation(EDIT_FOLDER);
//   const [deleteFolder] = useMutation(DELETE_FOLDER);

//   const handleDeleteFolder = (id: string): void => {
//     deleteFolder({
//       refetchQueries: [{ query: FOLDER }],
//       variables: { id },
//     });
//   };

//   const handleComplete = (event?: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
//     if (event) {
//       event.stopPropagation();
//     }

//     // TODO: элемент создающий новую папку имеет nodeId вида '/${parentNodeName}' (слеш вначале)
//     const pathname = value ? `${nodeId.substring(1)}${value.trim()}` : '';
//     const shared = pathname.startsWith(`/${FILES_SHARED_NAME}`);

//     if (pathname) {
//       editFolder({
//         refetchQueries: [{ query: FOLDER }],
//         variables: { pathname, shared },
//       });
//       setValue('');
//     }
//   };

//   const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
//     if (ifValid && event.keyCode === 13) {
//       handleComplete();
//     }
//   };

//   const handleChangeItem = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
//     setValue(event.currentTarget.value);
//   };

//   return (
//     <TreeItem
//       nodeId={nodeId}
//       label={
//         <>
//           <AddIcon color="inherit" className={classes.icon} />
//           <InputBase
//             color="secondary"
//             value={value}
//             onClick={(event) => event.stopPropagation()}
//             onKeyDown={handleKeyDown}
//             onChange={handleChangeItem}
//             placeholder={labelText}
//             className={classes.input}
//           />
//           {ifValid && (
//             <Box mr={1}>
//               <IconButton size="small" onClick={handleComplete}>
//                 <DoneIcon />
//               </IconButton>
//             </Box>
//           )}
//         </>
//       }
//       {...rest}
//     />
//   );
// };

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
              <IconButton className={classes.action} size="small" onClick={handleEditItem(1)}>
                <AddIcon />
              </IconButton>
              {!!id && (
                <>
                  <IconButton className={classes.action} size="small" onClick={handleEditItem(2)}>
                    <EditIcon />
                  </IconButton>
                  {!parent && (
                    <IconButton className={classes.action} size="small" onClick={handleEditItem(3)}>
                      <DeleteIcon />
                    </IconButton>
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
