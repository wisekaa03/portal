/** @format */

import { FIRST_PAGE, ALLOW_REDIRECT_PAGES } from './constants';

export default (pathname: string): string => {
  if (pathname && typeof pathname === 'string' && ALLOW_REDIRECT_PAGES.some((p) => pathname.startsWith(p))) {
    return encodeURI(pathname);
  }

  return encodeURI(FIRST_PAGE);
};
