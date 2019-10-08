/** @format */

// #region Imports NPM
import React from 'react';
import { ShallowWrapper } from 'enzyme';
import { createShallow } from '@material-ui/core/test-utils';
import { Toolbar } from '@material-ui/core';
// #endregion
// #region Imports Local
import AppBar from '../components/app-bar';
// #endregion

describe('AppBar', () => {
  let component: ShallowWrapper;
  const props = { handleDrawerOpen: (): void => {} };

  beforeAll(() => {
    component = createShallow()(<AppBar {...props} />);
  });

  it('render component', () => {
    expect(component.find(AppBar)).toBeDefined();
  });

  it('find Toolbar', () => {
    expect(component.find(Toolbar)).toBeDefined();
  });

  it('find logo', () => {
    expect(component.find('img').length).toEqual(1);
  });
});
