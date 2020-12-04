/** @format */

//#region Imports NPM
import React, { forwardRef, useState } from 'react';
import { Typography, Box, InputBase, IconButton, Popper, ClickAwayListener, MenuList, MenuItem, Paper, Tooltip } from '@material-ui/core';
import { fade, Theme, makeStyles, createStyles } from '@material-ui/core/styles';

import { Search as SearchIcon, Settings as SettingsIcon, HelpOutline as HelpIcon, Clear as ClearIcon } from '@material-ui/icons';
//#endregion
//#region Imports Local
import { PhonebookSearchProps } from '@lib/types';
import { useTranslation } from '@lib/i18n-client';
import { Icon } from '@front/components/ui/icon';
//#endregion

const panelHeight = 48;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    panel: {
      height: panelHeight,
      backgroundColor: '#F7FBFA',
      borderBottom: '1px solid rgba(224, 224, 224, 1)',
    },
    search: {
      'backgroundColor': fade(theme.palette.common.white, 0.15),
      '&:hover': {
        backgroundColor: fade(theme.palette.common.white, 0.25),
      },
    },
    searchIcon: {
      width: theme.spacing(7),
      height: '100%',
      pointerEvents: 'none',
    },
    inputRoot: {
      color: 'inherit',
    },
    inputInput: {
      padding: theme.spacing(1, 1, 1, 7),
      minHeight: '32px',
    },
    suggestionsPopper: {
      zIndex: theme.zIndex.appBar,
      marginLeft: theme.spacing(7),
    },
    icon: {
      'color': theme.palette.secondary.main,
      'opacity': 0.6,
      'transition': `all 200ms ${theme.transitions.easing.easeOut} 0ms`,

      '&:hover': {
        opacity: 1,
      },
    },
    margin: {
      margin: '0 0 0 10px',
    },
  }),
);

const PhonebookSearch = forwardRef<HTMLInputElement, PhonebookSearchProps>(
  (
    { search, suggestions, handleSearch, handleSugClose, handleSugKeyDown, handleSugClick, handleHelpOpen, handleSettingsOpen },
    forwardedRef,
  ) => {
    const classes = useStyles({});
    const { t } = useTranslation();
    const [openTooltip, setOpenTooltip] = useState<boolean>(false);

    const handleCloseTooltip = (): void => {
      setOpenTooltip(false);
    };

    const handleOpenTooltip = (): void => {
      setOpenTooltip(true);
    };

    const handleClearSearch = (): void => {
      handleSearch({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
    };

    const handleCurrentSearch = (event: React.ChangeEvent<HTMLInputElement>): void => {
      setOpenTooltip(!event.target.value);
      handleSearch(event);
    };

    const showedSuggestions = suggestions.length > 0;

    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }} className={classes.panel}>
        <Box sx={{ flexGrow: 1, position: 'relative' }} className={classes.search}>
          <Box
            sx={{ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            className={classes.searchIcon}
          >
            <SearchIcon color="secondary" />
          </Box>
          <Tooltip
            open={openTooltip}
            onOpen={handleOpenTooltip}
            onClose={handleCloseTooltip}
            title={t('phonebook:help.search') || ''}
            placement="top-start"
          >
            <InputBase
              ref={forwardedRef}
              placeholder={t('common:search')}
              value={search}
              onChange={handleCurrentSearch}
              fullWidth
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
              inputProps={{ 'aria-label': 'search' }}
            />
          </Tooltip>
          <Popper
            id="search-suggestions"
            placement="bottom-start"
            className={classes.suggestionsPopper}
            open={showedSuggestions}
            anchorEl={typeof forwardedRef === 'object' && forwardedRef !== null ? forwardedRef.current : undefined}
            disablePortal
          >
            <Paper>
              {showedSuggestions && (
                <ClickAwayListener onClickAway={handleSugClose}>
                  <MenuList onKeyDown={handleSugKeyDown}>
                    {suggestions.map((item, index) => {
                      if (index === 10) {
                        return (
                          <Typography className={classes.margin} align="center">
                            {item.name}
                          </Typography>
                        );
                      }
                      if (index > 10) {
                        return null;
                      }
                      return (
                        <MenuItem key={item.name} onClick={handleSugClick}>
                          <Icon base64 src={item.avatar} size={21} />
                          <Typography className={classes.margin} component="span">
                            {item.name}
                          </Typography>
                        </MenuItem>
                      );
                    })}
                  </MenuList>
                </ClickAwayListener>
              )}
            </Paper>
          </Popper>
        </Box>
        <IconButton type="button" className={classes.icon} onClick={handleClearSearch} aria-label="clear">
          <ClearIcon />
        </IconButton>
        <Tooltip title={t('common:help') || ''}>
          <IconButton className={classes.icon} onClick={handleHelpOpen}>
            <HelpIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('common:settings') || ''}>
          <IconButton className={classes.icon} onClick={handleSettingsOpen}>
            <SettingsIcon />
          </IconButton>
        </Tooltip>
      </Box>
    );
  },
);

export default PhonebookSearch;
