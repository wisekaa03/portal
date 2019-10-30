/** @format */
/* eslint @typescript-eslint/indent:0 */

// #region Imports NPM
import NextI18Next from 'next-i18next';
// eslint-disable-next-line import/named
import { useTranslation as originalUseTranslation, WithTranslation } from 'react-i18next';
import { NextComponentType, NextPageContext } from 'next';
// #endregion
// #region Imports Local
// #endregion

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
        : '.nest/public/locales'
      : 'locales',
  otherLanguages: ['en'],
});

export const { appWithTranslation, Trans } = nextI18next;
export const useTranslation = originalUseTranslation;
export const includeDefaultNamespaces = (namespaces: string[]): string[] => ['common'].concat(namespaces);

export type I18nPage<P = {}> = NextComponentType<
  NextPageContext,
  { namespacesRequired: string[] },
  WithTranslation & P & { namespacesRequired: string[] }
>;

export default nextI18next;
