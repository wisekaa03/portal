/** @format */

// #region Imports NPM
// #endregion
// #region Imports Local
import { getStorage } from '../session-storage';
// #endregion

export default {
  Me: {
    isLoggedIn() {
      // eslint-disable-next-line no-debugger
      debugger;

      return getStorage('token') !== '';
    },
  },
};
