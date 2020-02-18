/** @format */
import { parseCookies, setCookie, destroyCookie } from 'nookies';

type CookieOptionsType = { [key: string]: string | number };
type CookieDataType = { [key: string]: string };

export default class Cookie {
  static options(): CookieOptionsType {
    return {
      // 30 дней
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    };
  }

  static get(ctx?: any): CookieDataType {
    return parseCookies(ctx);
  }

  static set(name: string, value: string, ctx?: any): void {
    setCookie(ctx, name, value, Cookie.options());
  }

  static remove(name: string, ctx?: any): void {
    destroyCookie(ctx, name, Cookie.options());
  }
}
