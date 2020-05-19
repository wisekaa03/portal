/** @format */

//#region Imports NPM
//#endregion
//#region Imports Local
import { getStorage } from '../session-storage';
import { SESSION } from '../constants';
//#endregion

export default {
  Me: {
    isLoggedIn() {
      // eslint-disable-next-line no-debugger
      debugger;

      return getStorage(SESSION) !== '';
    },
  },
};
