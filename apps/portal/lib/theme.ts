/** @format */

import { fade, darken, createMuiTheme, Theme } from '@material-ui/core/styles';
import red from '@material-ui/core/colors/red';
import {
  RobotoLightCyr,
  RobotoLightItalicLatin,
  RobotoLightLatin,
  RobotoLightItalicCyr,
  RobotoRegularCyr,
  RobotoBoldCyr,
  RobotoThinCyr,
  RobotoItalicCyr,
  RobotoRegularLatin,
  RobotoBoldLatin,
  RobotoThinLatin,
  RobotoThinItalicCyr,
  RobotoBoldItalicCyr,
  RobotoThinItalicLatin,
  RobotoBoldItalicLatin,
  RobotoItalicLatin,
} from './fonts';

export const MaterialUI_primary_main = '#2c4373';

export const MaterialUI = (fontSize?: number, ssrMatchMedia?: (query: string) => { matches: boolean }): Theme => {
  const theme = createMuiTheme({
    typography: {
      fontFamily: ['Roboto', 'Arial'].join(','),
      // fontSize,
      // htmlFontSize: fontSize ? fontSize + 2 : undefined,
    },
    palette: {
      primary: {
        main: MaterialUI_primary_main,
      },
      secondary: {
        main: '#6AA7C8',
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
      borderRadius: 4,
    },
    props: {
      MuiButtonBase: {
        disableRipple: true,
      },
    },
  });

  if (ssrMatchMedia) {
    theme.props = {
      MuiUseMediaQuery: {
        ssrMatchMedia,
      },
    };
  }

  theme.overrides = {
    MuiPaper: {
      root: {
        color: '#31312F',
      },
    },
    MuiSvgIcon: {
      root: {
        // 'color': '#6AA7C8',
        // '&:hover': {
        //   color: darken('#6AA7C8', 0.3),
        // },
      },
    },
    MuiCssBaseline: {
      '@global': {
        '@font-face': [
          RobotoItalicCyr,
          RobotoRegularCyr,
          RobotoBoldItalicCyr,
          RobotoBoldCyr,
          RobotoLightItalicCyr,
          RobotoLightCyr,
          RobotoThinItalicCyr,
          RobotoThinCyr,

          RobotoItalicLatin,
          RobotoRegularLatin,
          RobotoBoldItalicLatin,
          RobotoBoldLatin,
          RobotoLightItalicLatin,
          RobotoLightLatin,
          RobotoThinItalicLatin,
          RobotoThinLatin,
        ],
        'html': {
          fontSize,
          overflow: 'hidden',
        },
      },
    },
    MuiTooltip: {
      tooltip: {
        color: '#000',
        backgroundColor: '#fff',
        boxShadow: theme.shadows[3],
      },
    },
    MuiToolbar: {
      root: {
        height: '64px',
      },
    },
    MuiOutlinedInput: {
      root: {
        'backgroundColor': '#F5FDFF',
        'borderRadius': theme.shape.borderRadius,
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
      colorPrimary: {
        color: '#6AA7C8!important',
      },
    },
    MuiRadio: {
      root: {
        color: 'inherit',
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
    MuiInputLabel: {
      root: {
        color: `${fade('#31312F', 0.5)}!important`,
      },
    },
    MuiFab: {
      primary: {
        'backgroundColor': '#6AA7C8',
        '&:hover': {
          backgroundColor: darken('#6AA7C8', 0.2),
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
    MuiFormControl: {
      root: {
        borderRadius: theme.shape.borderRadius,
      },
    },
    MuiSelect: {
      root: {
        backgroundColor: '#F5FDFF',
      },
    },
    MuiButton: {
      containedSecondary: {
        color: '#fff',
      },
      contained: {
        color: '#fff',
        backgroundColor: theme.palette.primary.main,
      },
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

  return theme;
};
