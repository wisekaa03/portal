/** @format */

// #region Imports NPM
import React, { FC } from 'react';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import {
  Box,
  Typography,
  Button,
  Checkbox,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  TextField,
  Tooltip,
} from '@material-ui/core';
// #endregion
// #region Imports Local
import { useTranslation } from '@lib/i18n-client';
import { LoginComponentProps } from '@lib/types';
import Loading from '@front/components/loading';
import Background2 from '@public/images/svg/background2.svg';
import Logo from '@public/images/svg/logo.svg';
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
    card: {
      width: 600,
      maxWidth: '95vw',
      padding: theme.spacing(4),
      backgroundColor: 'rgba(255,255,255,0.5)',
      color: '#2c4373',
      border: 'solid 3px #2c4373',
      borderRadius: 16,
      paddingLeft: 24,
    },
    title: {
      color: '#2c4373',
      textAlign: 'left',
      marginBottom: theme.spacing(),
    },
    formControl: {
      margin: theme.spacing(1, 0),

      [theme.breakpoints.up('sm')]: {
        minWidth: 320,
      },
    },
    textField: {
      borderColor: 'rgba(44, 67, 115, 0.4)',
    },
    checkBox: {
      borderColor: 'rgba(44, 67, 115, 0.4)',
      width: '100%',
    },
    submit: {
      'borderRadius': 24,
      'width': 'fit-content',
      'marginTop': theme.spacing(),

      '&:hover, &:disabled': {
        color: '#2c4373',
      },

      '&:disabled': {
        borderRadius: 24,
        marginTop: theme.spacing(),
      },
    },
  }),
);

export const LoginComponent: FC<LoginComponentProps> = ({
  usernameRef,
  passwordRef,
  values,
  loading,
  handleValues,
  handleSubmit,
  handleKeyDown,
}) => {
  const classes = useStyles({});
  const { t } = useTranslation();

  return (
    <Box className={classes.root}>
      <Box>
        <img src={Logo} alt="logo" className={classes.logo} />
      </Box>
      <Box display="flex" textAlign="center" justifyContent="center" alignItems="center" height="70vh">
        <Card className={classes.card}>
          <CardContent onKeyDown={handleKeyDown}>
            <Typography className={classes.title} variant="h4">
              {t('common:authorization')}
            </Typography>
            <Tooltip title={t('login:tooltip')} placement="top" leaveDelay={3000}>
              <FormControl className={classes.formControl} fullWidth variant="outlined">
                <TextField
                  inputRef={usernameRef}
                  name="username"
                  type="text"
                  autoFocus
                  value={values.username}
                  onChange={handleValues('username')}
                  disabled={loading}
                  label={t('login:username')}
                  variant="outlined"
                  className={classes.textField}
                />
              </FormControl>
            </Tooltip>
            <FormControl className={classes.formControl} fullWidth variant="outlined">
              <TextField
                inputRef={passwordRef}
                name="password"
                type="password"
                value={values.password}
                onChange={handleValues('password')}
                disabled={loading}
                label={t('login:password')}
                variant="outlined"
                className={classes.textField}
              />
            </FormControl>
            <FormControlLabel
              className={classes.checkBox}
              control={
                <Checkbox
                  checked={values.save}
                  onChange={handleValues('save')}
                  value="save"
                  color="primary"
                  disabled={loading}
                />
              }
              label={t('login:remember')}
            />
            <Loading activate={loading}>
              <FormControl style={{ width: '100%' }}>
                <Button
                  className={classes.submit}
                  type="submit"
                  variant="outlined"
                  color="primary"
                  size="large"
                  disabled={loading}
                  onClick={handleSubmit}
                >
                  {t('login:signIn')}
                </Button>
              </FormControl>
            </Loading>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};
