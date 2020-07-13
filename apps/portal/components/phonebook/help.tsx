/** @format */
/** @format */

//#region Imports NPM
import React, { useState } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { MobileStepper, Card, Paper, Typography, Button, Box, IconButton } from '@material-ui/core';
import { ArrowBackRounded, KeyboardArrowLeft, KeyboardArrowRight, FileCopy, Settings } from '@material-ui/icons';
import SwipeableViews from 'react-swipeable-views';
//#endregion
//#region Imports Local
import { nextI18next } from '@lib/i18n-client';
import { HelpDataProps, PhonebookHelpProps } from '@lib/types';
import Img1 from '@public/images/png/help/phonebook/img1.png';
import Img2 from '@public/images/png/help/phonebook/img2.png';
import Img3 from '@public/images/png/help/phonebook/img3.png';
import Img4 from '@public/images/png/help/phonebook/img4.png';
import Img5 from '@public/images/png/help/phonebook/img5.png';
//#endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      position: 'relative',
      width: '80vw',
      maxWidth: 1400,
      flexGrow: 1,
    },
    backButton: {
      position: 'absolute',
      top: theme.spacing(1.5),
      left: theme.spacing(2),
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
          <li>Отдел</li>
          <li>Должность</li>
          <li>Телефон</li>
          <li>Мобильный</li>
          <li>Внутренний телефон</li>
        </ul>
        <Typography variant="body1">
          После ввода более трёх символов в форму поиска адресная книга отобразит все строки с найденными значениями вне
          зависимости от того, в каком из вышеперечисленных столбцов найдена информация. Например, при вводе цифр 1112
          отобразится список системных администраторов с телефоном 1112
        </Typography>
      </>
    ),
  },
  {
    id: 1,
    image: Img2,
    text: (
      <>
        <Typography variant="body1">
          При нажатии на строку адресной книги в появившемся всплывающем окне отобразится подробная информация о
          сотруднике. Здесь активными являются строки: «Компания», «Департамент», «Должность», «Отдел», «Руководитель» и
          e-mail. Например, при нажатии на «Департамент» отобразятся все сотрудники данного департамента. При нажатии на
          строку «Руководитель» откроется карточка руководителя сотрудника. При нажатии на e-mail откроется форма
          отправки почты с заполненным адресатом.
        </Typography>
        <Typography variant="body1">
          Для удобства пользователей iMac копирование информации в буфер обмена осуществляется нажатием кнопки{' '}
          <FileCopy style={{ opacity: 0.6 }} fontSize="small" /> справа от строки.
        </Typography>
      </>
    ),
  },
  {
    id: 2,
    image: Img3,
    text: (
      <>
        <Typography variant="body1">
          Поисковая строка адресной книги поддерживает комбинированные запросы, набранные через знак «+». Например,
          чтобы отобразить всех сотрудников департамента ИТ наберите в поисковой строке
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
        <Typography variant="body1">При вводе в поисковую форму</Typography>
        <Box textAlign="center">
          <b>1112 + поддерж</b>
        </Box>
        <Typography variant="body1">
          Адресная книга отобразит всех специалистов поддержки пользователей департамента ИТ и разработки с номером 1112
        </Typography>
      </>
    ),
  },
  {
    id: 4,
    image: Img5,
    text: (
      <>
        <Typography variant="body1">
          Для настройки отображения колонок адресной книги используйте значок{' '}
          <Settings style={{ opacity: 0.6 }} fontSize="small" /> в правом верхнем углу. В появившемся всплывающем окне
          отметьте галочками какую информацию Вам нужно отобразить. Затем нажмите кнопку «Применить». Эти настройки
          запоминаются в профиле пользователя и не сбиваются после выхода из адресной книги.
        </Typography>
        <Typography variant="body1">
          Для настройки отображения колонок в значения по умолчанию используйте кнопку «Сбросить».
        </Typography>
      </>
    ),
  },
];

const PhonebookHelp = React.forwardRef(({ onClose, t }: PhonebookHelpProps, ref?: React.Ref<React.Component>) => {
  const classes = useStyles({});

  const [step, setStep] = useState<number>(0);
  const maxSteps = helpData.length;

  const handleNext = (): void => {
    setStep((previousStep) => previousStep + 1);
  };

  const handleBack = (): void => {
    setStep((previousStep) => previousStep - 1);
  };

  const handleStepChange = (s: number): void => {
    setStep(s);
  };

  return (
    <Card ref={ref} className={classes.root}>
      <IconButton size="small" className={classes.backButton} onClick={onClose}>
        <ArrowBackRounded />
      </IconButton>
      <Paper square elevation={0} className={classes.header}>
        <Typography variant="h6">{t('phonebook:help.title')}</Typography>
      </Paper>
      <SwipeableViews index={step} onChangeIndex={handleStepChange} enableMouseEvents>
        {helpData.map((current, idx) => (
          <Box key={current.id}>
            {Math.abs(step - idx) <= 2 ? (
              <Paper square elevation={0} className={classes.content}>
                <Box className={classes.imageBox}>
                  <img src={current.image} alt="help" />
                </Box>
                <Box>{current.text}</Box>
              </Paper>
            ) : null}
          </Box>
        ))}
      </SwipeableViews>
      <MobileStepper
        steps={maxSteps}
        position="static"
        variant="dots"
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
