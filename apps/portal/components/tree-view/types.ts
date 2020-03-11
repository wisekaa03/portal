/** @format */

import { TreeViewProps as MuiTreeViewProps } from '@material-ui/lab/TreeView';
import { TreeItemProps as MuiTreeItemProps } from '@material-ui/lab/TreeItem';

export type TreeItemDefaultProps = MuiTreeItemProps & {
  labelText: string;
  labelInfo?: string;
  depth?: number;
};

export type TreeItemCreatorProps = MuiTreeItemProps & {
  labelText: string;
  handleCreate: (_: string) => void;
  depth?: number;
};

export type TreeItemProps = MuiTreeItemProps & {
  label: React.ReactNode;
  depth?: number;
};

export type TreeViewProps = MuiTreeViewProps & {
  selected: string;
  setSelected: React.Dispatch<React.SetStateAction<string>>;
};
