/** @format */

//#region Imports NPM
import NextI18Next, { WithTranslation } from 'next-i18next';
import { useTranslation as originalUseTranslation } from 'react-i18next';
import { NextComponentType, NextPageContext } from 'next';
//#endregion
//#region Imports Local
//#endregion

const detectionOrder: string[] = [];

export const nextI18next = new NextI18Next({
  browserLanguageDetection: true, // Set-Cookie: next-i18next
  serverLanguageDetection: true,
  defaultLanguage: 'ru',
  defaultNS: 'common',
  detection: { order: detectionOrder },
  fallbackLng: 'ru',
  ignoreRoutes: ['/_next/', '/public/'],
  localePath:
    typeof window === 'undefined'
      ? process.env.NODE_ENV !== 'production'
        ? 'public/locales'
        : 'public/locales'
      : process.env.NODE_ENV !== 'production'
      ? 'locales'
      : 'locales',
  otherLanguages: ['en'],
});

export const { appWithTranslation, Trans } = nextI18next;
export const useTranslation = originalUseTranslation;
export const includeDefaultNamespaces = (namespaces: string[]): string[] => ['common'].concat(namespaces);

type WithRouter = {
  pathname?: string;
  query?: { [key: string]: string };
};

export type I18nPage<P = Record<string, unknown>> = NextComponentType<
  NextPageContext,
  { namespacesRequired: string[] },
  WithTranslation & P & { namespacesRequired: string[] } & WithRouter
>;

export default nextI18next;
