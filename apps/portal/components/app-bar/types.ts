/** @format */

export interface AppBarComponentProps {
  open: boolean;
  anchorEl: null | HTMLElement;
  handleDrawerOpen: () => void;
  handlePopoverOpen: (_: React.MouseEvent<HTMLElement>) => void;
  handlePopoverClose: () => void;
  handleLogout: () => void;
}
