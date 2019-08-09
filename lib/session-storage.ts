/** @format */

// #region Imports NPM
// #endregion
// #region Imports Local
// #endregion

export const getStorage = (name: string): string => (__SERVER__ ? '' : window.sessionStorage.getItem(name) || '');

export const setStorage = (name: string, value: string): void => {
  !__SERVER__ && window.sessionStorage.setItem(name, value);
};
