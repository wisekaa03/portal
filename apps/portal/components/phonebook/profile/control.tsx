/** @format */

//#region Imports NPM
import React, { FC, Children } from 'react';
import Link from 'next/link';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import { Paper, IconButton, ClickAwayListener, MenuList, MenuItem, Popper } from '@material-ui/core';
import { MoreVertRounded as MoreVertIcon } from '@material-ui/icons';
//#endregion
//#region Imports Local
import { useTranslation } from '@lib/i18n-client';
import { PhonebookProfileControlProps } from '@lib/types';
//#endregion

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      padding: 0,
    },
    popper: {
      zIndex: 1300,
    },
  }),
);

const Wire = ({ children, ...props }): any => Children.only(children(props));

const PhonebookProfileControl: FC<PhonebookProfileControlProps> = ({
  controlEl,
  profileId: id,
  handleControl,
  handleCloseControl,
}) => {
  const classes = useStyles({});
  const { t } = useTranslation();

  const openControl = Boolean(controlEl);

  return (
    <IconButton className={classes.root} onClick={handleControl}>
      <MoreVertIcon />
      <Popper
        id="profile-setting"
        placement="bottom-end"
        className={classes.popper}
        open={openControl}
        anchorEl={controlEl}
        transition
      >
        <Paper>
          <ClickAwayListener onClickAway={handleCloseControl}>
            <MenuList>
              <Wire>
                {() => (
                  <Link href={{ pathname: `/profile/edit`, query: { id } }} as={`/profile/edit/${id}`} passHref>
                    <MenuItem>{t('phonebook:profile.edit')}</MenuItem>
                  </Link>
                )}
              </Wire>
            </MenuList>
          </ClickAwayListener>
        </Paper>
      </Popper>
    </IconButton>
  );
};

export default PhonebookProfileControl;
