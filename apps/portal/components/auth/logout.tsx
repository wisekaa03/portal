/** @format */

// #region Imports NPM
import React, { FC } from 'react';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { Typography, Button, Card, CardContent, FormControl } from '@material-ui/core';
// #endregion
// #region Imports Local
import Loading from '@front/components/loading';
import Background2 from '@public/images/svg/background2.svg';
import Logo from '@public/images/svg/logo.svg';
import { useTranslation } from '@lib/i18n-client';
import { LogoutPageProps } from '@lib/types';
// #endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      backgroundSize: 'cover',
      backgroundImage: `url(${Background2})`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'bottom center',
      height: '100vh',
    },
    logo: {
      height: '11vh',
      margin: '10px auto',
      width: '100%',
    },
    logoutContainer: {
      height: '70vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
    },
    container: {
      width: 600,
      maxWidth: '95vw',
      margin: `${theme.spacing(2)}px auto`,
    },
    card: {
      padding: theme.spacing(4),
      backgroundColor: 'rgba(255,255,255,0.5)',
      color: '#2c4373',
      border: 'solid 3px #2c4373',
      borderRadius: 16,
      paddingLeft: 24,
    },
    typoAuthorization: {
      color: '#2c4373',
      textAlign: 'left',
      marginBottom: theme.spacing(),
    },
    labelForFormControl: {
      borderColor: 'rgba(44, 67, 115, 0.4)',
    },
    labelForCheckbox: {
      borderColor: 'rgba(44, 67, 115, 0.4)',
      width: '100%',
    },
    formControl: {
      margin: theme.spacing(1, 0),

      [theme.breakpoints.up('sm')]: {
        minWidth: 320,
      },
    },
    submitButtonContainer: {
      width: '100%',
    },
    submitButton: {
      'borderRadius': 24,
      'width': 'fit-content',
      'marginTop': theme.spacing(),

      '&:disabled': {
        color: '#2c4373',
        borderRadius: 24,
        marginTop: theme.spacing(),
      },

      '&:hover': {
        color: '#2c4373',
      },
    },
  }),
);

const LogoutComponent: FC<LogoutPageProps> = ({ loading, logout }): React.ReactElement => {
  const classes = useStyles({});
  const { t } = useTranslation();

  return (
    <div className={classes.root}>
      <div>
        <img src={Logo} alt="Logo" className={classes.logo} />
      </div>
      <div className={classes.logoutContainer}>
        <form
          onSubmit={async (e: any): Promise<void> => {
            e.preventDefault();
            logout();
          }}
          className={classes.container}
          autoComplete="off"
          noValidate
        >
          <Card className={classes.card}>
            <CardContent>
              <Typography className={classes.typoAuthorization} variant="h4">
                {t('login:authorization')}
              </Typography>
              <Loading activate={loading}>
                <FormControl className={classes.submitButtonContainer}>
                  <Button
                    className={classes.submitButton}
                    type="submit"
                    variant="outlined"
                    color="primary"
                    size="large"
                    disabled={loading}
                  >
                    {t('login:signOut')}
                  </Button>
                </FormControl>
              </Loading>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default LogoutComponent;
