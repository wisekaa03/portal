/** @format */

import type React from 'react';
import type { RefreshComponentProps } from './material';

export interface AppBarComponentProps<TData = any, TResultImpl = '*', TResult = any> {
  open: boolean;
  anchorEl: null | HTMLElement;
  refetchComponent?: RefreshComponentProps<TData, TResultImpl, TResult>;
  handleDrawerOpen: () => void;
  handlePopoverOpen: (_: React.MouseEvent<HTMLElement>) => void;
  handlePopoverClose: () => void;
  handleLogout: () => void;
}
