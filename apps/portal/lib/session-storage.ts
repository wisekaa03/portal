/** @format */

//#region Imports NPM
//#endregion
//#region Imports Local
//#endregion

export const getStorage = (name: string): string => (__SERVER__ ? '' : sessionStorage.getItem(name) || '');

export const setStorage = (name: string, value: string): void => {
  if (!__SERVER__) sessionStorage.setItem(name, value);
};

export const removeStorage = (name: string): void => {
  if (!__SERVER__) sessionStorage.removeItem(name);
};
