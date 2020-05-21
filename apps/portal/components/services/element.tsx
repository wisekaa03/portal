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
import { ServicesElementProps } from '@lib/types';
import ConditionalWrapper from '@lib/conditional-wrapper';
import BaseIcon from '@front/components/ui/icon';
import { useTranslation } from '@lib/i18n-client';
//#endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      'padding': theme.spacing(2),
      'borderRadius': theme.spacing(),
      'display': 'grid',
      'gridTemplateColumns': '60px 1fr',
      'gap': `${theme.spacing()}px`,
      'justifyItems': 'flex-start',
      'alignItems': 'center',
      'height': '100%',
      'width': 'max-content',
      'cursor': 'pointer',
      'color': '#484848',
      '&:hover:not($active)': {
        backgroundColor: '#E9F2F5',
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
      borderBottom: '1px solid rgba(46, 45, 43, 0.7)',
      gridTemplateRows: `repeat(2, ${theme.spacing(3)}px)`,
      gridTemplateColumns: `1fr 24px`,
      minWidth: 200,
    },
    name: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      fontSize: theme.spacing(2),
      letterSpacing: 0.15,
    },
    subtitle: {
      fontSize: theme.spacing(1.5),
      letterSpacing: 0.25,
    },
    more: {
      'gridRowStart': 1,
      'gridRowEnd': 3,
      'gridColumnStart': 2,
      'padding': theme.spacing(0.25, 0),

      '&:hover': {
        color: '#808080',
      },
    },
    moreButton: {
      padding: 0,
    },
  }),
);

const pathname = '/services';

const ServicesElement: FC<ServicesElementProps> = ({
  base64,
  active,
  element,
  url,
  withLink,
  favorite,
  setFavorite,
  isUp,
  isDown,
}) => {
  const classes = useStyles({});
  const { t } = useTranslation();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const handleOpenMore = useCallback((event: React.MouseEvent<HTMLElement>): void => {
    setAnchor(event.currentTarget);
  }, []);

  const handleCloseMore = useCallback((): void => {
    setAnchor(null);
  }, []);

  const handleFavorite = useCallback(
    (action) => (event): void => {
      event.stopPropagation();
      setFavorite({ id: element.code, action });
      handleCloseMore();
    },
    [element.code, handleCloseMore, setFavorite],
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
              query: { route: element.code },
            }
          }
          as={url || `${pathname}/${element.code}`}
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
          <BaseIcon base64={base64} src={element.avatar} size={48} />
        </Box>
        <Box className={classes.info}>
          <Typography variant="subtitle1" className={classes.name}>
            {element.name}
          </Typography>
          <Typography variant="subtitle1" className={classes.subtitle}>
            {element.subtitle}
          </Typography>
          <Box className={classes.more}>
            {favorite && (
              <IconButton className={classes.moreButton} onClick={handleOpenMore}>
                <MoreVertIcon />
                <Popper placement="bottom-end" open={!!anchor} anchorEl={anchor} transition>
                  <Paper>
                    <ClickAwayListener onClickAway={handleCloseMore}>
                      <MenuList>
                        {isUp && (
                          <MenuItem onClick={handleFavorite('up')}>
                            <ListItemIcon>
                              <KeyboardArrowUpIcon fontSize="small" />
                            </ListItemIcon>
                            <Typography variant="inherit">{t('services:favorite.up')}</Typography>
                          </MenuItem>
                        )}
                        {isDown && (
                          <MenuItem onClick={handleFavorite('down')}>
                            <ListItemIcon>
                              <KeyboardArrowDownIcon fontSize="small" />
                            </ListItemIcon>
                            <Typography variant="inherit">{t('services:favorite.down')}</Typography>
                          </MenuItem>
                        )}
                        <MenuItem onClick={handleFavorite('delete')}>
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

export default ServicesElement;
