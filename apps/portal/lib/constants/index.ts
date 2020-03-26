/** @format */

// #region Imports NPM
// #endregion
// #region Imports Local
import { LoginService, Gender, UserContext } from '@lib/types';
// #endregion

export * from './app-bar';
export * from './ldap-sync';

export const AUTH_PAGE = '/auth/login';
export const FIRST_PAGE = '/phonebook';
export const SESSION = 'session';
export const ADMIN_PAGES = [
  '/mail',
  // '/profile',
  // '/services',
  '/calendar',
  '/faq',
  '/meetings',
  '/news',
  '/files',
  // '/settings',
  '/admin',
];
export const HIDDEN_PAGES = [
  '/mail',
  // '/profile',
  // '/services',
  '/calendar',
  '/faq',
  '/meetings',
  '/news',
  '/files',
  // '/settings',
  '/admin',
];
// export const ADMIN_PAGES = ['/admin'];

export const ALLOW_REDIRECT_PAGES = [
  '/mail',
  '/phonebook',
  '/profile',
  '/services',
  '/calendar',
  '/faq',
  '/meetings',
  '/files',
  '/news',
  '/settings',
  '/admin',
];
export const LARGE_RESOLUTION = 1440;
export const AUTO_COLLAPSE_ROUTES = [
  /* '/mail' */
];

export const TICKET_STATUSES = ['Все заявки', 'В работе', 'Регистрация', 'Завершение', 'Приостановлено', 'Выполнено'];

export const ADMIN_GROUP = 'web master';

// TEST
export const MOCK_PROFILE: UserContext = {
  user: {
    isAdmin: true,
    loginService: LoginService.LDAP,
    loginIdentificator: '',
    username: '',
    disabled: false,
    settings: {},
    profile: {
      username: '',
      loginService: LoginService.LDAP,
      loginIdentificator: '',
      dn: '',
      firstName: '',
      lastName: '',
      middleName: '',
      email: '',
      birthday: new Date(),
      gender: Gender.UNKNOWN,
      country: '',
      postalCode: '',
      region: '',
      town: '',
      street: '',
      room: '',
      company: '',
      title: '',
      telephone: '',
      workPhone: '',
      mobile: '',
      fax: '',
      companyeng: '',
      nameeng: '',
      departmenteng: '',
      otdeleng: '',
      positioneng: '',
      disabled: false,
      notShowing: false,
    },
  },
};

// ////////// PHONEBOOK ///////////
export const PHONEBOOK_HIDDEN_COLS = ['disabled', 'notShowing'];
export const PHONEBOOK_ROW_HEIGHT = 72;

// ////////////////////////////////

// ////////// PROFILE ///////////
export const PROFILE_AUTOCOMPLETE_FIELDS = [
  'company',
  'department',
  'otdel',
  'country',
  'region',
  'town',
  'street',
  'postalCode',
  'manager',
];

// ////////////////////////////////

// ////////// PROFILE ///////////
export const FILES_SHARED_NAME = 'shared';
// ////////////////////////////////
