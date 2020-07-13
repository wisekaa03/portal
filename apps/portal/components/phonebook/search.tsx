/** @format */

//#region Imports NPM
import React, { forwardRef, useState } from 'react';
import { Typography } from '@material-ui/core';
import { fade, Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import {
  Box,
  InputBase,
  IconButton,
  Popper,
  ClickAwayListener,
  MenuList,
  MenuItem,
  Paper,
  Tooltip,
} from '@material-ui/core';
import { Search as SearchIcon, Settings as SettingsIcon, HelpOutline as HelpIcon } from '@material-ui/icons';
//#endregion
//#region Imports Local
import { PhonebookSearchProps } from '@lib/types';
import RefreshButton from '@front/components/ui/refresh-button';
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

const PhonebookSearch = forwardRef(
  (
    {
      search,
      suggestions,
      refetch,
      handleSearch,
      handleSugClose,
      handleSugKeyDown,
      handleSugClick,
      handleHelpOpen,
      handleSettingsOpen,
    }: PhonebookSearchProps,
    ref: React.MutableRefObject<HTMLInputElement>,
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

    const handleCurrentSearch = (event: React.ChangeEvent<HTMLInputElement>): void => {
      setOpenTooltip(!event.target.value);
      handleSearch(event);
    };

    const showedSuggestions = suggestions.length > 0;

    return (
      <Box display="flex" alignItems="center" className={classes.panel}>
        <Box flexGrow={1} position="relative" ml={0} mr={2} className={classes.search}>
          <Box
            position="absolute"
            display="flex"
            alignItems="center"
            justifyContent="center"
            className={classes.searchIcon}
          >
            <SearchIcon color="secondary" />
          </Box>
          <Tooltip
            open={openTooltip}
            onOpen={handleOpenTooltip}
            onClose={handleCloseTooltip}
            title={t('phonebook:help.search') || ''}
            interactive
            placement="top-start"
          >
            <InputBase
              ref={ref}
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
            anchorEl={() => ref?.current}
            disablePortal
          >
            <Paper>
              {showedSuggestions && (
                <ClickAwayListener onClickAway={handleSugClose}>
                  <MenuList onKeyDown={handleSugKeyDown}>
                    {suggestions.map((item) => (
                      <MenuItem key={item.name} onClick={handleSugClick}>
                        <Icon base64 src={item.avatar} size={21} />
                        <Typography className={classes.margin} component="span">
                          {item.name}
                        </Typography>
                      </MenuItem>
                    ))}
                  </MenuList>
                </ClickAwayListener>
              )}
            </Paper>
          </Popper>
        </Box>
        <Tooltip title={t('common:help') || ''}>
          <IconButton className={classes.icon} onClick={handleHelpOpen}>
            <HelpIcon />
          </IconButton>
        </Tooltip>
        <RefreshButton noAbsolute disableBackground onClick={() => refetch()} />
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
