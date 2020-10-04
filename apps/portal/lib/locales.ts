/** @format */

import type { Locale } from 'date-fns';
import { enUS as en, ru } from 'date-fns/locale';

export interface PortalLocales {
  en: Locale;
  ru: Locale;
}

export const localesDate: PortalLocales = {
  en,
  ru,
};
