/** @format */

export const CONFIG_OPTIONS = 'CONFIG_OPTIONS';

export interface LDAPDomainConfig {
  url: string;
  bindDn: string;
  bindPw: string;
  searchBase: string;
  searchUser: string;
  searchGroup: string;
  hideSynchronization?: string;
  searchAllUsers?: string;
  searchAllGroups?: string;
  newBase?: string;
}
