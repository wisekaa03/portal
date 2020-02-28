/** @format */
/** @format */

// #region Imports NPM
import React, { useState } from 'react';
// import clsx from 'clsx';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { MobileStepper, Card, Paper, Typography, Button, Box } from '@material-ui/core';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@material-ui/icons';
import SwipeableViews from 'react-swipeable-views';
import { WithTranslation } from 'next-i18next';
// #endregion
// #region Imports Local
import { nextI18next } from '../../lib/i18n-client';
import { HelpDataProps } from './types';
import Img1 from '../../public/images/jpeg/help/phonebook/img1.jpg';
import Img2 from '../../public/images/jpeg/help/phonebook/img2.jpg';
import Img3 from '../../public/images/jpeg/help/phonebook/img3.jpg';
import Img4 from '../../public/images/jpeg/help/phonebook/img4.jpg';
import Img5 from '../../public/images/jpeg/help/phonebook/img5.jpg';
// #endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      maxWidth: '80vw',
      flexGrow: 1,
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: 50,
      padding: theme.spacing(),
    },
    content: {
      display: 'grid',
      gridTemplateColumns: '600px 1fr',
      gap: `${theme.spacing(4)}px`,
      justifyContent: 'center',
      padding: theme.spacing(0, 2),
    },
    imageBox: {
      'width': 600,
      'height': 400,
      'display': 'flex',
      'justifyContent': 'center',
      'alignItems': 'center',

      '& > img': {
        maxWidth: '100%',
        height: 'auto',
        maxHeight: 400,
      },
    },
  }),
);

// const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

const helpData: HelpDataProps[] = [
  {
    id: 0,
    image: Img1,
    text: (
      <>
        <Typography variant="body1">Поиск одновременно производится по следующим колонкам адресной книги:</Typography>
        <ul>
          <li>ФИО</li>
          <li>Логин</li>
          <li>Компания</li>
          <li>Департамент</li>
          <li>Должность</li>
          <li>Телефон</li>
          <li>Мобильный</li>
          <li>Внутренний телефон</li>
        </ul>
        <Typography variant="body1">
          После ввода более трёх символов в поисковую строку адресная книга отобразит все соответствующие строки.
          Например при вводе цифр 1112 отобразится список системных администраторов с телефоном 1112
        </Typography>
      </>
    ),
  },
  {
    id: 1,
    image: Img2,
    text: (
      <Typography variant="body1">
        При нажатии на строку адресной книги в появившемся всплывающем окне отобразится подробная информация о
        сотруднике.
      </Typography>
    ),
  },
  {
    id: 2,
    image: Img3,
    text: (
      <>
        <Typography variant="body1">
          Поисковая строка адресной книги поддерживает комбинированные запросы набранные через знак плюс.
        </Typography>
        <Typography variant="body1">
          Например, чтобы отобразить всех сотрудников департамента ИТ наберите в поисковой строке
        </Typography>
        <Box textAlign="center">
          <b>Деп + ит</b>
        </Box>
        <Typography variant="body1">В появившемся выпадающем списке выберите «Департамент ИТ и разработки».</Typography>
      </>
    ),
  },
  {
    id: 3,
    image: Img4,
    text: (
      <>
        <Typography variant="body1">
          Чтобы отобразить всех бухгалтеров компании ООО «Нефтебитум», наберите в поисковой строке
        </Typography>
        <Box textAlign="center">
          <b>Нефте + бухг</b>
        </Box>
      </>
    ),
  },
  {
    id: 4,
    image: Img5,
    text: (
      <Typography variant="body1">
        Для настройки отображения колонок адресной книги используйте значок шестерёнки в правом верхнем углу. В
        появившемся всплывающем окне отметьте галочками какую информацию Вам нужно отобразить и нажмите кнопку
        «Применить». Эти настройки запоминаются в профиле пользователя и не сбиваются после выхода из адресной книги.
        Для настройки отображения колонок в значения по умолчанию используйте кнопку «Сброс».
      </Typography>
    ),
  },
];

const PhonebookHelp = React.forwardRef(({ t }: WithTranslation, ref?: React.Ref<React.Component>) => {
  const classes = useStyles({});

  const [step, setStep] = useState<number>(0);
  const maxSteps = helpData.length;

  const handleNext = (): void => {
    setStep((prevStep) => prevStep + 1);
  };

  const handleBack = (): void => {
    setStep((prevStep) => prevStep - 1);
  };

  const handleStepChange = (s: number): void => {
    setStep(s);
  };

  return (
    <Card ref={ref} className={classes.root}>
      <Paper square elevation={0} className={classes.header}>
        <Typography variant="h6">{t('phonebook:help.title')}</Typography>
      </Paper>
      <SwipeableViews index={step} onChangeIndex={handleStepChange} enableMouseEvents>
        {helpData.map((cur, idx) => (
          <Box key={cur.id}>
            {Math.abs(step - idx) <= 2 ? (
              <Paper square elevation={0} className={classes.content}>
                <Box className={classes.imageBox}>
                  <img src={cur.image} alt="help" />
                </Box>
                <Box>{cur.text}</Box>
              </Paper>
            ) : null}
          </Box>
        ))}
      </SwipeableViews>
      <MobileStepper
        steps={maxSteps}
        position="static"
        variant="text"
        activeStep={step}
        nextButton={
          <Button size="small" onClick={handleNext} disabled={step === maxSteps - 1}>
            {t('phonebook:help.next')}
            <KeyboardArrowRight />
          </Button>
        }
        backButton={
          <Button size="small" onClick={handleBack} disabled={step === 0}>
            <KeyboardArrowLeft />
            {t('phonebook:help.back')}
          </Button>
        }
      />
    </Card>
  );
});

export default nextI18next.withTranslation('phonebook')(PhonebookHelp);
