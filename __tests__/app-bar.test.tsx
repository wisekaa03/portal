/** @format */

// #region Imports NPM
import React from 'react';
import { ShallowWrapper } from 'enzyme';
import { createShallow } from '@material-ui/core/test-utils';
import { Toolbar, Popover } from '@material-ui/core';
// #endregion
// #region Imports Local
import AppBar from '../components/app-bar';
// #endregion

describe('AppBar component', () => {
  let component: ShallowWrapper;
  const props = { handleDrawerOpen: (): void => {} };

  beforeAll(() => {
    component = createShallow()(<AppBar {...props} />);
  });

  it('match snapshot', () => {
    expect(component).toMatchSnapshot();
  });

  it('render component', () => {
    expect(component.find(AppBar)).toBeDefined();
  });

  it('find Toolbar', () => {
    expect(component.find(Toolbar)).toBeDefined();
  });

  it('find logo', () => {
    expect(component.find('img')).toHaveLength(1);
  });

  it('find popover', () => {
    expect(component.find(Popover)).toBeDefined();
  });

  // TODO: довести до ума (createMount вместо createShallow)
  // it('simulate open', () => {
  //   expect(component.find('#profile-popover')).toHaveLength(0);
  //   component.find('#profile-avatar').simulate('click');
  //   expect(component.find('#profile-popover')).toHaveLength(1);
  // });
});
