/** @format */

//#region Imports NPM
import React, { FC } from 'react';
import { TFunction } from 'next-i18next';
import { useMutation } from '@apollo/client';
import { Button, Paper, Typography, CardActions, Card, Box } from '@material-ui/core';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import Slider from '@material-ui/core/Slider';
//#endregion
//#region Imports Local
import { FONT_SIZE_SMALL, FONT_SIZE_NORMAL, FONT_SIZE_BIG } from '@lib/constants';
import { ProfileContext } from '@lib/context';
import { nextI18next, useTranslation } from '@lib/i18n-client';
import { USER_SETTINGS } from '@lib/queries';
import { changeFontSize } from '@lib/font-size';

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
    label: t('profile:fontSize:small'),
  },
  {
    value: FONT_SIZE_NORMAL,
    label: t('profile:fontSize:medium'),
  },
  {
    value: FONT_SIZE_BIG,
    label: t('profile:fontSize:big'),
  },
];

const ProfileSettingsComponent: FC = () => {
  const classes = useStyles({});
  const { t } = useTranslation();

  const [userSettings] = useMutation(USER_SETTINGS, {
    // onCompleted: () => {
    //   router.reload();
    // },
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

  const handleFontSize = (event: React.ChangeEvent<Record<string, unknown>>, newValue: number | number[]) => {
    const fontSize = (Array.isArray(newValue) ? newValue.pop() : newValue) || FONT_SIZE_NORMAL;

    changeFontSize(fontSize);

    userSettings({
      variables: {
        value: {
          fontSize,
        },
      },
    });
  };

  return (
    <div className={classes.root}>
      <ProfileContext.Consumer>
        {(context) => (
          <>
            {context.user && (
              <>
                <Card className={classes.card}>
                  <CardActions disableSpacing>
                    <Button fullWidth color="primary" variant="contained" onClick={handleLanguage(context.user.settings?.lng)}>
                      {t('profile:changeLanguage')}
                    </Button>
                  </CardActions>
                </Card>
                <Card className={classes.card}>
                  <CardActions disableSpacing>
                    <Typography id="discrete-slider" gutterBottom>
                      {t('profile:fontSize:title')}
                    </Typography>
                    <Box className={classes.fontSize}>
                      <Slider
                        defaultValue={context.user.settings?.fontSize || FONT_SIZE_NORMAL}
                        value={context.user.settings?.fontSize || FONT_SIZE_NORMAL}
                        onChange={handleFontSize}
                        // step={5}
                        marks={fontSizeMarks(t)}
                        min={FONT_SIZE_SMALL}
                        max={FONT_SIZE_BIG}
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
  );
};

export default ProfileSettingsComponent;
