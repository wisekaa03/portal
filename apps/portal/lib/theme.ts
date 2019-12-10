/** @format */

import { fade, createMuiTheme } from '@material-ui/core/styles';
import red from '@material-ui/core/colors/red';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#2c4373',
    },
    secondary: {
      main: '#5F9898',
    },
    error: {
      main: red.A400,
    },
    background: {
      default: '#fff',
    },
    /*
    action: {
      active: 'rgba(44, 67, 115, 0.54)',
      hover: 'rgba(44, 67, 115, 0.84)',
      hoverOpacity: 0.84,
      selected: 'rgba(44, 67, 115, 0.54)',
      disabled: 'rgba(0, 0, 0, 0.26)',
      disabledBackground: 'rgba(0, 0, 0, 0.12)',
    },
    */
  },
  shape: {
    borderRadius: 0,
  },
  props: {
    MuiButtonBase: {
      disableRipple: true,
    },
  },
});

theme.overrides = {
  MuiToolbar: {
    root: {
      height: '64px',
    },
  },
  MuiOutlinedInput: {
    root: {
      'borderRadius': theme.spacing() / 2,
      '&:hover:not($focused):not($disabled) $notchedOutline': {
        borderColor: fade(theme.palette.primary.main, 0.75),
      },
      '&$focused $notchedOutline': {
        borderColor: theme.palette.primary.main,
      },
    },
    colorSecondary: {
      '&, & $notchedOutline': {
        borderColor: fade(theme.palette.secondary.main, 0.5),
      },
      '&:hover:not($focused):not($disabled) $notchedOutline': {
        borderColor: fade(theme.palette.secondary.main, 0.75),
      },
      '&$focused $notchedOutline': {
        borderColor: theme.palette.secondary.main,
      },
    },
    notchedOutline: {
      borderWidth: 2,
      borderRadius: 'inherit',
      borderColor: fade(theme.palette.primary.main, 0.5),
    },
  },
  MuiCheckbox: {
    root: {
      color: theme.palette.primary.main,
    },
  },
  MuiFormLabel: {
    root: {
      'color:not($disabled)': theme.palette.primary.main,
      '&$colorSecondary:not($disabled)': {
        color: theme.palette.secondary.main,
      },
    },
  },
  MuiInputBase: {
    root: {
      'borderColor': theme.palette.primary.main,
      '&$colorSecondary': {
        borderColor: theme.palette.secondary.main,
      },
    },
  },
  MuiCard: {
    root: {},
  },
  MuiCardContent: {
    root: {
      'padding': 0,
      [theme.breakpoints.up('sm')]: {
        padding: '8px 46px',
      },
      '&:last-child': {
        paddingBottom: 8,
      },
    },
  },
  MuiButton: {
    outlinedPrimary: {
      'color': '#fff',
      'backgroundColor': theme.palette.primary.main,
      '&:hover': {
        color: theme.palette.primary.main,
      },
      '&:disabled': {
        color: 'rgba(0, 0, 0, 0.5)',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
      },
    },
  },
  MuiIconButton: {
    root: {
      'color': 'inherit',
      '&:hover': {
        backgroundColor: 'inherit',
      },
    },
  },
  MuiTypography: {
    body1: {
      fontSize: 'inherit',
    },
  },
  MuiTableCell: {
    root: {
      padding: theme.spacing(),
    },
  },
  MuiListItem: {
    root: {
      '&$selected, &$selected:hover': {
        backgroundColor: 'rgba(146, 159, 183, 0.3)',
      },
    },
  },
};

export default theme;
