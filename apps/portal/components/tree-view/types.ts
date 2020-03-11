/** @format */

import { TreeViewProps as MuiTreeViewProps } from '@material-ui/lab/TreeView';
import { TreeItemProps as MuiTreeItemProps } from '@material-ui/lab/TreeItem';

export type TreeItemProps = MuiTreeItemProps & {
  labelText: string;
  id: string;
  active: boolean;
  handleEdit: (_: string, __?: string) => void;
  handleDelete: (_: string) => void;
  depth?: number;
};

export type TreeViewProps = MuiTreeViewProps & {
  selected: string;
  setSelected: React.Dispatch<React.SetStateAction<string>>;
};