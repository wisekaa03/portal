/** @format */

//#region Imports NPM
import React from 'react';
import Head from 'next/head';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import Slider from '@material-ui/core/Slider';
import { Button, Paper, Typography, CardActions, Card, Box } from '@material-ui/core';
import { useMutation } from '@apollo/react-hooks';
import { TFunction } from 'next-i18next';
//#endregion
//#region Imports Local
import { FONT_SIZE_SMALL, FONT_SIZE_NORMAL, FONT_SIZE_BIG } from '@lib/constants';
import { MaterialUI } from '@front/layout';
import { ProfileContext } from '@lib/context';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '@lib/i18n-client';
import { USER_SETTINGS } from '@lib/queries';
import { CURRENT_USER } from '../lib/queries';
import { useRouter } from 'next/router';
//#endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(2),
      display: 'grid',
      gridTemplateColumns: '100%',
      height: 'fit-content',
      gap: `${theme.spacing()}px`,
    },
    fontSize: {
      display: 'block',
      width: '80%',
      paddingLeft: '10em',
    },
    card: {
      width: '100%',
    },
  }),
);

const fontSizeMarks = (t: TFunction) => [
  {
    value: FONT_SIZE_SMALL,
    label: t('setting:fontSize:small'),
  },
  {
    value: FONT_SIZE_NORMAL,
    label: t('setting:fontSize:medium'),
  },
  {
    value: FONT_SIZE_BIG,
    label: t('setting:fontSize:big'),
  },
];

const SettingsPage: I18nPage = ({ t, ...rest }): React.ReactElement => {
  const classes = useStyles({});
  const router = useRouter();

  const [userSettings] = useMutation(USER_SETTINGS, {
    onCompleted: () => {
      router.reload();
    },
  });

  const handleLanguage = (previousLng?: 'ru' | 'en' | '' | null) => (): void => {
    const currentLng = previousLng || nextI18next.i18n.language;
    const lng = currentLng === 'ru' ? 'en' : 'ru';

    nextI18next.i18n.changeLanguage(lng);
    userSettings({
      variables: {
        value: { lng },
      },
    });
  };

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const handleFontSize = (event: React.ChangeEvent<Record<string, unknown>>, newValue: number | number[]) => {
    const fontSize = newValue || FONT_SIZE_NORMAL;

    userSettings({
      variables: {
        value: {
          fontSize,
        },
      },
    });
  };

  return (
    <>
      <Head>
        <title>{t('setting:title')}</title>
      </Head>
      <MaterialUI {...rest}>
        <div className={classes.root}>
          <ProfileContext.Consumer>
            {(context) => (
              <>
                {context.user && (
                  <>
                    <Card className={classes.card}>
                      <CardActions disableSpacing>
                        <Button
                          fullWidth
                          color="primary"
                          variant="contained"
                          onClick={handleLanguage(context.user.settings?.lng)}
                        >
                          {t('setting:changeLanguage')}
                        </Button>
                      </CardActions>
                    </Card>
                    <Card className={classes.card}>
                      <CardActions disableSpacing>
                        <Typography id="discrete-slider" gutterBottom>
                          {t('setting:fontSize:title')}
                        </Typography>
                        <Box className={classes.fontSize}>
                          <Slider
                            defaultValue={context.user.settings?.fontSize || FONT_SIZE_NORMAL}
                            onChange={handleFontSize}
                            // step={5}
                            marks={fontSizeMarks(t)}
                            min={9}
                            max={21}
                          />
                        </Box>
                      </CardActions>
                    </Card>
                  </>
                )}
              </>
            )}
          </ProfileContext.Consumer>
        </div>
      </MaterialUI>
    </>
  );
};

SettingsPage.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['setting']),
});

export default nextI18next.withTranslation('setting')(SettingsPage);
