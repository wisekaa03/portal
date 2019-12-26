/** @format */

// #region Imports NPM
// #endregion
// #region Imports Local
import { LoginService, Gender } from '../src/shared/interfaces';
import { UserContext } from '../src/user/models/user.dto';
// #endregion

export const FIRST_PAGE = '/';
export const SESSION = 'session';
export const ADMIN_PAGES = ['/admin'];
export const ALLOW_REDIRECT_PAGES = [
  '/mail',
  '/phonebook',
  '/profile',
  '/services',
  '/calendar',
  '/faq',
  '/meetings',
  '/news',
  '/settings',
  '/admin',
];
export const LARGE_RESOLUTION = 1440;
export const AUTO_COLLAPSE_ROUTES = ['/mail'];

export const ADMIN_GROUP = 'web master';

// TEST
export const MOCK_PROFILE: UserContext = {
  user: {
    isAdmin: true,
    username: '',
    disabled: false,
    settings: {},
    profile: {
      loginService: LoginService.LDAP,
      loginIdentificator: '',
      username: '',
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
