/** @format */

const defaultCookie = process.env.SESSION_NAME;

const getCookie = (name = defaultCookie): string | undefined => {
  const matches = document.cookie.match(
    // eslint-disable-next-line no-useless-escape
    new RegExp(`(?:^|; )${name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1')}=([^;]*)`),
  );
  return matches ? decodeURIComponent(matches[1]) : undefined;
};

export default getCookie;
