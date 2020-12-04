/** @format */

//#region Imports NPM
import React, { FC } from 'react';
import Link from 'next/link';
import { Theme, alpha, makeStyles, createStyles } from '@material-ui/core/styles';
import { Box, Button } from '@material-ui/core';
//#endregion
//#region Imports Local
import { useTranslation } from '@lib/i18n-client';
import { ProfileContext } from '@lib/context';
import Avatar from '@front/components/ui/avatar';
//#endregion

const avatarHeight = 180;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    avatar: {
      width: avatarHeight,
      height: avatarHeight,
      borderRadius: theme.shape.borderRadius,
    },
    personal: {
      flex: 1,
      background: alpha(theme.palette.secondary.main, 0.15),
      padding: theme.spacing(),
      color: theme.palette.secondary.main,
      borderRadius: theme.shape.borderRadius,
      marginBottom: theme.spacing(),
    },
    links: {
      'display': 'grid',
      'gap': `${theme.spacing()}px`,
      'gridAutoColumns': 180,
      'gridAutoRows': 'minmax(45px, 1fr)',
      '& > a': {
        borderRadius: theme.shape.borderRadius,
        lineHeight: '1.2em',
        textAlign: 'center',
      },
    },
  }),
);

const ProfileInfoComponent: FC = () => {
  const classes = useStyles({});
  const { t } = useTranslation();
  // const profileContext = useContext(ProfileContext);
  // const profile = profileContext?.user?.profile;

  return (
    <ProfileContext.Consumer>
      {({ user }) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
          {user && (
            <>
              <Box>
                <Avatar fullSize className={classes.avatar} profile={user.profile} alt="photo" />
              </Box>
              <div className={classes.personal}>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  {user.profile.lastName && <span>{user.profile.lastName}</span>}
                  {user.profile.firstName && <span>{user.profile.firstName}</span>}
                  {user.profile.middleName && <span>{user.profile.middleName}</span>}
                </Box>
                <div className={classes.links}>
                  <Link href={{ pathname: '/profile/edit' }} as="/profile/edit" passHref>
                    <Button color="secondary" component="a" variant="contained">
                      {t('profile:btnEdit')}
                    </Button>
                  </Link>
                  {/* <Link href={{ pathname: '/profile/equipment' }} as="/profile/equipment" passHref>
                    <Button color="secondary" component="a" variant="contained">
                      {t('profile:btnEquipment')}
                    </Button>
                  </Link> */}
                </div>
              </div>
            </>
          )}
        </Box>
      )}
    </ProfileContext.Consumer>
  );
};

export default ProfileInfoComponent;
