/** @format */

// #region Imports NPM
import React, { useContext, useEffect, useState } from 'react';
import Head from 'next/head';
import { fade, Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { Box, Typography, TextField, IconButton, InputAdornment, Divider } from '@material-ui/core';
import { useLazyQuery } from '@apollo/react-hooks';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import EditIcon from '@material-ui/icons/Edit';
import uuidv4 from 'uuid/v4';
// #endregion
// #region Imports Local
import { Profile } from '../../src/profile/models/profile.dto';
import Page from '../../layouts/main';
import { Avatar } from '../../components/avatar';
import { Loading } from '../../components/loading';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '../../lib/i18n-client';
import { ProfileContext } from '../../lib/context';
import { PROFILE } from '../../lib/queries';
// #endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    firstBlock: {
      display: 'grid',
      gridGap: theme.spacing(2),
      gridTemplateColumns: '1fr 1fr',
      width: '100%',
    },
    secondBlock: {
      display: 'grid',
      gridGap: theme.spacing(2),
      gridTemplateColumns: '1fr 1fr 1fr 1fr',
      width: '100%',
    },
    avatar: {
      height: 150,
      width: 150,
      borderRadius: theme.spacing() / 2,
    },
    nameBlock: {
      'display': 'flex',
      'flex': 1,
      'justifyContent': 'center',
      'flexDirection': 'column',
      'padding': theme.spacing(),
      'backgroundColor': fade(theme.palette.secondary.main, 0.05),
      'color': theme.palette.secondary.main,
      '& > h6': {
        fontSize: '1.4rem',
      },
    },
    hr: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
  }),
);

const firstBlock: Array<keyof Profile> = [
  'company',
  'companyEng',
  'department',
  'departmentEng',
  'otdel',
  'otdelEng',
  'title',
  'positionEng',
];

const lastBlock: Array<keyof Profile> = [
  'manager',
  'birthday',
  'email',
  'telephone',
  'mobile',
  'workPhone',
  'country',
  'region',
  'town',
  'street',
  'postalCode',
];

const ProfileEdit: I18nPage = ({ t, ...rest }): React.ReactElement => {
  const classes = useStyles({});
  const [getProfile, { loading, error, data }] = useLazyQuery(PROFILE);
  const [current, setCurrent] = useState<Profile | undefined>();
  const profile = useContext(ProfileContext);
  const isAdmin = profile && profile.user && profile.user.isAdmin;
  const router = useRouter();

  // TODO: пока так, потом переделать с выводом ошибок
  useEffect(() => {
    if (isAdmin && router && router.query && router.query.id) {
      getProfile({
        variables: { id: router.query.id },
      });
    } else {
      setCurrent(profile.user.profile);
    }
  }, [isAdmin, getProfile, router, profile.user]);

  useEffect(() => {
    if (isAdmin && !loading) {
      if (!error && data && data.profile) {
        setCurrent(data.profile);
      } else {
        setCurrent(profile.user.profile);
      }
    }
  }, [loading, data, isAdmin, error, profile.user.profile]);

  // console.log(current);

  return (
    <>
      <Head>
        <title>{t('profile:title')}</title>
      </Head>
      <Page {...rest}>
        <Box display="flex" flexDirection="column">
          {!current && <Loading noMargin type="linear" variant="indeterminate" />}
          <Box display="flex" flexDirection="column" p={2}>
            <Box display="flex">
              <Link href={{ pathname: '/profile' }} passHref>
                <IconButton>
                  <ArrowBackIcon />
                </IconButton>
              </Link>
            </Box>
            <Box display="flex" flexDirection="column">
              {current && (
                <>
                  <div className={classes.firstBlock}>
                    <Box display="flex">
                      <Box mr={1}>
                        <Avatar fullSize className={classes.avatar} profile={current} />
                      </Box>
                      <div className={classes.nameBlock}>
                        {current.lastName && <Typography variant="subtitle2">{current.lastName}</Typography>}
                        {current.firstName && <Typography variant="subtitle2">{current.firstName}</Typography>}
                        {current.middleName && <Typography variant="subtitle2">{current.middleName}</Typography>}
                      </div>
                    </Box>
                    <div className={classes.nameBlock}>
                      {current.lastName && <Typography variant="subtitle2">{current.lastName}</Typography>}
                      {current.firstName && <Typography variant="subtitle2">{current.firstName}</Typography>}
                      {current.middleName && <Typography variant="subtitle2">{current.middleName}</Typography>}
                    </div>
                    {firstBlock.map((item) => (
                      <div key={uuidv4()}>
                        <TextField
                          fullWidth
                          color="secondary"
                          value={current[item] || ''}
                          label={t(`phonebook:fields.${item}`)}
                          variant="outlined"
                          InputProps={{
                            readOnly: true,
                            endAdornment: (
                              <InputAdornment position="end">
                                <EditIcon color="secondary" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <Divider className={classes.hr} />
                  <div className={classes.secondBlock}>
                    {lastBlock.reduce((result: JSX.Element[], item: keyof Profile) => {
                      let value = current[item];

                      if (item === 'manager') {
                        const { manager } = current;

                        if (manager) {
                          value = `${manager.lastName || ''} ${manager.firstName || ''} ${manager.middleName || ''}`;
                        }
                      }

                      return [
                        ...result,
                        <div key={uuidv4()}>
                          <TextField
                            fullWidth
                            color="secondary"
                            value={value || ''}
                            label={t(`phonebook:fields.${item}`)}
                            variant="outlined"
                            InputProps={{
                              readOnly: true,
                              endAdornment: (
                                <InputAdornment position="end">
                                  <EditIcon color="secondary" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </div>,
                      ];
                    }, [])}
                  </div>
                </>
              )}
            </Box>
          </Box>
        </Box>
      </Page>
    </>
  );
};

ProfileEdit.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['profile', 'phonebook']),
});

export default nextI18next.withTranslation('profile')(ProfileEdit);
