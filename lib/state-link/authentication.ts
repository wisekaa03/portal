/** @format */

// #region Imports NPM
// #endregion
// #region Imports Local
import { getStorage } from '../session-storage';
// #endregion

export const StateLinkAuthentication = {
  Query: {
    isLogin() {
      return getStorage('token') !== '';
    },
  },
};
