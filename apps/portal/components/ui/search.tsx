/** @format */
//#region Imports NPM
import React, { FC } from 'react';
import { fade, Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { Box, InputBase } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
//#endregion
//#region Imports Local
import { useTranslation } from '@lib/i18n-client';
//#endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      'borderRadius': theme.shape.borderRadius,
      'backgroundColor': fade(theme.palette.common.white, 0.15),
      '&:hover': {
        backgroundColor: fade(theme.palette.common.white, 0.25),
      },
      'width': '100%',
    },
    icon: {
      color: theme.palette.secondary.main,
      width: theme.spacing(7),
      height: '100%',
      pointerEvents: 'none',
      zIndex: 1,
    },
    inputRoot: {
      color: theme.palette.secondary.main,
      borderRadius: theme.shape.borderRadius,
      width: '100%',
    },
    inputInput: {
      padding: theme.spacing(1, 1, 1, 7),
      transition: theme.transitions.create('width'),
      width: '100%',
      [theme.breakpoints.up('sm')]: {
        'width': 240,
        '&:focus': {
          width: 300,
        },
      },
    },
  }),
);

interface SearchComponentProps {
  value: string;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const SearchComponent: FC<SearchComponentProps> = ({ value, handleChange }) => {
  const classes = useStyles({});
  const { t } = useTranslation();

  return (
    <Box sx={{ position: 'relative' }} className={classes.root}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'absolute' }} className={classes.icon}>
        <SearchIcon />
      </Box>
      <InputBase
        placeholder={t('common:search')}
        value={value}
        onChange={handleChange}
        classes={{
          root: classes.inputRoot,
          input: classes.inputInput,
        }}
        inputProps={{ 'aria-label': 'search' }}
      />
    </Box>
  );
};

export default SearchComponent;
