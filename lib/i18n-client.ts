/** @format */
/* eslint @typescript-eslint/indent:0 */

// #region Imports NPM
import i18n from 'i18next';
import NextI18Next from 'next-i18next';
import { useTranslation as originalUseTranslation } from 'react-i18next';
import { NextComponentType, NextPageContext } from 'next';
// #endregion
// #region Imports Local
// #endregion

const detectionOrder: string[] = [];

export const nextI18next = new NextI18Next({
  browserLanguageDetection: true,
  serverLanguageDetection: true,
  defaultLanguage: 'ru',
  defaultNS: 'common',
  detection: { order: detectionOrder },
  fallbackLng: 'ru',
  keySeparator: '###',
  ignoreRoutes: ['/_next/', '/public/'],
  localePath: /* typeof window === 'undefined' ? 'locales' : */ 'public/locales',
  otherLanguages: ['en'],
});

export const { appWithTranslation } = nextI18next;
export const { Trans } = nextI18next;
export const useTranslation = originalUseTranslation;
export const includeDefaultNamespaces = (namespaces: string[]): string[] => ['common', '_error'].concat(namespaces);

export type I18n = i18n.i18n;
export type TFunction = i18n.TFunction;
export type I18nPage<P = {}> = NextComponentType<
  NextPageContext,
  { namespacesRequired: string[]; statusCode?: number; errorCode?: number },
  P & { namespacesRequired: string[]; statusCode?: number; errorCode?: number }
>;
