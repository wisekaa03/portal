/** @format */

import { FIRST_PAGE, ALLOW_REDIRECT_PAGES } from './constants';

const redirect = (pathname: any): string => {
  if (pathname && typeof pathname === 'string' && ALLOW_REDIRECT_PAGES.some((p) => pathname.startsWith(p))) {
    return pathname;
  }

  return FIRST_PAGE;
};

export default redirect;
