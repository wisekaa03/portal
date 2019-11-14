/** @format */

// #region Imports NPM
// #endregion
// #region Imports Local
// #endregion

export const getStorage = (name: string): string => (__SERVER__ ? '' : localStorage.getItem(name) || '');

export const setStorage = (name: string, value: string): void => {
  !__SERVER__ && localStorage.setItem(name, value);
};

export const removeStorage = (name: string): void => {
  !__SERVER__ && localStorage.removeItem(name);
};
