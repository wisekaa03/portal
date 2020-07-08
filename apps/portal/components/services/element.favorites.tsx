/** @format */

//#region Imports NPM
import React, { FC, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import {
  Box,
  Typography,
  IconButton,
  Popper,
  ClickAwayListener,
  MenuList,
  MenuItem,
  Paper,
  ListItemIcon,
} from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVertRounded';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUpOutlined';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDownOutlined';
import DeleteIcon from '@material-ui/icons/DeleteOutlined';
import clsx from 'clsx';
//#endregion
//#region Imports Local
import { ServicesElementFavProps } from '@lib/types';
import ConditionalWrapper from '@lib/conditional-wrapper';
import BaseIcon from '@front/components/ui/icon';
import { useTranslation } from '@lib/i18n-client';
//#endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      'padding': theme.spacing(2),
      'borderRadius': theme.shape.borderRadius,
      'display': 'grid',
      'gridTemplateColumns': '60px 1fr',
      'gap': `${theme.spacing()}px`,
      'justifyItems': 'flex-start',
      'alignItems': 'center',
      'alignContent': 'flex-start',
      'height': '100%',
      'width': 'max-content',
      'cursor': 'pointer',
      'color': '#484848',
      'backgroundColor': '#E9F2F5',
      '-webkit-box-shadow': '5px 5px 5px -5px rgba(0,0,0,0.5)',
      '-moz-box-shadow': '5px 5px 5px -5px rgba(0,0,0,0.5)',
      'boxShadow': '5px 5px 5px -5px rgba(0,0,0,0.5)',
      '&:hover': {
        color: '#0173c1',
      },
    },
    active: {
      padding: 0,
      cursor: 'default',
    },
    moreOpen: {
      backgroundColor: '#E9F2F5',
    },
    info: {
      display: 'grid',
      gap: `${theme.spacing(0.5)}px`,
      // borderBottom: '1px solid rgba(46, 45, 43, 0.7)',
      gridTemplateRows: `repeat(3, ${theme.spacing(3)}px)`,
      gridTemplateColumns: `1fr 24px`,
      minWidth: 200,
      width: 400,
      // maxWidth: 400,
    },
    name: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      letterSpacing: 0.15,
      // color: '#31312F',
    },
    oneFavorites: {
      whiteSpace: 'normal',
      gridRowStart: 1,
      gridRowEnd: 4,
      placeItems: 'center',
      display: 'grid',
    },
    subtitle: {
      letterSpacing: 0.25,
    },
    more: {
      gridRowStart: 1,
      gridRowEnd: 3,
      gridColumnStart: 2,
      padding: theme.spacing(0.25, 0),

      // '&:hover': {
      //   color: '#808080',
      // },
    },
    moreButton: {
      padding: 0,
    },
  }),
);

const pathname = '/services';

const ServicesElementFavorites: FC<ServicesElementFavProps> = ({
  favorite,
  base64,
  active,
  url,
  withLink,
  setFavorite,
  loadingSettings,
  isUp,
  isDown,
}) => {
  const classes = useStyles({});
  const { t } = useTranslation();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const handleOpenMore = useCallback(async (event: React.MouseEvent<HTMLElement>): Promise<void> => {
    event.preventDefault();
    setAnchor(event.currentTarget);
  }, []);

  const handleCloseMore = useCallback(async (): Promise<void> => {
    setAnchor(null);
  }, []);

  const handleFavorite = useCallback(
    (action) => async (event: React.MouseEvent<HTMLLIElement, MouseEvent>): Promise<void> => {
      event.stopPropagation();
      if (typeof setFavorite === 'function' && favorite.route && favorite.service) {
        setFavorite({
          favorite: {
            code: favorite.route.code,
            where: favorite.route.where,
            svcCode: favorite.service.code,
          },
          action,
        });
      }
      handleCloseMore();
    },
    [favorite, handleCloseMore, setFavorite],
  );

  useEffect(() => {
    handleCloseMore();
  }, [favorite, handleCloseMore]);

  return (
    <ConditionalWrapper
      condition={withLink}
      wrapper={(children) => (
        <Link
          href={
            url || {
              pathname,
              query: { where: favorite.route.where, route: favorite.route.code, service: favorite.service.code },
            }
          }
          as={url || `${pathname}/${favorite.route.where}/${favorite.route.code}/${favorite.service.code}`}
          passHref
        >
          {url ? <a target="_blank">{children}</a> : children}
        </Link>
      )}
    >
      <Box
        className={clsx(classes.root, {
          [classes.active]: active,
          [classes.moreOpen]: !!anchor,
        })}
      >
        <Box>
          <BaseIcon base64={base64} src={favorite.service?.avatar} size={48} />
        </Box>
        <Box className={classes.info}>
          <Typography
            variant="subtitle1"
            className={clsx(classes.name, { [classes.oneFavorites]: !favorite.service?.description })}
          >
            {favorite.service?.name}
          </Typography>
          {favorite.service?.description && (
            <Typography variant="subtitle1" className={classes.subtitle}>
              {favorite.service.description}
            </Typography>
          )}
          <Box className={classes.more}>
            {favorite && (
              <IconButton className={classes.moreButton} onClick={handleOpenMore}>
                <MoreVertIcon />
                <Popper placement="bottom-end" open={!!anchor} anchorEl={anchor} transition>
                  <Paper>
                    <ClickAwayListener onClickAway={handleCloseMore}>
                      <MenuList>
                        {isUp && (
                          <MenuItem disabled={loadingSettings} onClick={handleFavorite('up')}>
                            <ListItemIcon>
                              <KeyboardArrowUpIcon fontSize="small" />
                            </ListItemIcon>
                            <Typography variant="inherit">{t('services:favorite.up')}</Typography>
                          </MenuItem>
                        )}
                        {isDown && (
                          <MenuItem disabled={loadingSettings} onClick={handleFavorite('down')}>
                            <ListItemIcon>
                              <KeyboardArrowDownIcon fontSize="small" />
                            </ListItemIcon>
                            <Typography variant="inherit">{t('services:favorite.down')}</Typography>
                          </MenuItem>
                        )}
                        <MenuItem disabled={loadingSettings} onClick={handleFavorite('delete')}>
                          <ListItemIcon>
                            <DeleteIcon fontSize="small" />
                          </ListItemIcon>
                          <Typography variant="inherit">{t('services:favorite.delete')}</Typography>
                        </MenuItem>
                      </MenuList>
                    </ClickAwayListener>
                  </Paper>
                </Popper>
              </IconButton>
            )}
          </Box>
        </Box>
      </Box>
    </ConditionalWrapper>
  );
};

export default ServicesElementFavorites;
