/** @format */

import { alpha, darken, createMuiTheme, Theme } from '@material-ui/core/styles';
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

// export const MaterialUIPrimaryMain = '#2c4373';
export const MaterialUIPrimaryMain = '#3C6AA3';

export const MaterialUI = (fontSize?: number, ssrMatchMedia?: (query: string) => { matches: boolean }): Theme => {
  const theme = createMuiTheme({
    typography: {
      fontFamily: ['Roboto', 'Arial'].join(','),
      // fontSize,
      // htmlFontSize: fontSize ? fontSize + 2 : undefined,
    },
    palette: {
      primary: {
        main: MaterialUIPrimaryMain,
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
    components: {
      MuiButtonBase: {
        styleOverrides: {
          // disableRipple: true,
        },
      },
    },
  });

  if (ssrMatchMedia) {
    theme.components = {
      MuiUseMediaQuery: {
        defaultProps: {
          ssrMatchMedia,
        },
      },
    };
  }

  theme.components = {
    MuiPaper: {
      styleOverrides: {
        root: {
          color: '#31312F',
        },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          // 'color': '#6AA7C8',
          // '&:hover': {
          //   color: darken('#6AA7C8', 0.3),
          // },
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
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
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          color: '#000',
          backgroundColor: '#fff',
          boxShadow: theme.shadows[3],
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          height: '64px',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          'backgroundColor': '#F5FDFF',
          'borderRadius': theme.shape.borderRadius,
          '&:hover:not($focused):not($disabled) $notchedOutline': {
            borderColor: alpha(theme.palette.primary.main, 0.75),
          },
          '&$focused $notchedOutline': {
            borderColor: theme.palette.primary.main,
          },
        },
        colorSecondary: {
          '&, & $notchedOutline': {
            borderColor: alpha(theme.palette.secondary.main, 0.5),
          },
          '&:hover:not($focused):not($disabled) $notchedOutline': {
            borderColor: alpha(theme.palette.secondary.main, 0.75),
          },
          '&$focused $notchedOutline': {
            borderColor: theme.palette.secondary.main,
          },
        },
        notchedOutline: {
          borderWidth: 2,
          borderRadius: 'inherit',
          borderColor: alpha(theme.palette.primary.main, 0.5),
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        colorPrimary: {
          color: '#6AA7C8!important',
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: 'inherit',
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          'color:not($disabled)': theme.palette.primary.main,
          '&$colorSecondary:not($disabled)': {
            color: theme.palette.secondary.main,
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          'borderColor': theme.palette.primary.main,
          '&$colorSecondary': {
            borderColor: theme.palette.secondary.main,
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: `${alpha('#31312F', 0.5)}!important`,
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        primary: {
          'backgroundColor': '#6AA7C8',
          '&:hover': {
            backgroundColor: darken('#6AA7C8', 0.2),
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {},
      },
    },
    MuiCardContent: {
      styleOverrides: {
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
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          borderRadius: theme.shape.borderRadius,
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: '#F5FDFF',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
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
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          'color': 'inherit',
          '&:hover': {
            backgroundColor: 'inherit',
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        body1: {
          fontSize: 'inherit',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: theme.spacing(),
        },
        stickyHeader: {
          backgroundColor: '#F5FDFF',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          '&$selected, &$selected:hover': {
            backgroundColor: 'rgba(146, 159, 183, 0.3)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: '#F5FDFF',
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        root: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          borderTop: '1px solid rgba(224, 224, 224, 1)',
          backgroundColor: alpha(theme.palette.secondary.main, 0.05),
        },
        toolbar: {
          height: '3rem',
          minHeight: '3rem',
        },
        input: {
          backgroundColor: 'transparent',
        },
        select: {
          backgroundColor: 'transparent',
        },
      },
    },
  };

  return theme;
};
