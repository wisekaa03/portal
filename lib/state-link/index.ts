/** @format */

// #region Imports NPM
import merge from 'lodash/merge';
// #endregion
// #region Imports Local
import { StateLinkAuthentication } from './authentication';
// import { StateLinkNetworkStatus } from './network-status';
// #endregion

export const stateLinkResolvers = { ...merge(StateLinkAuthentication /* , StateLinkNetworkStatus */) };
