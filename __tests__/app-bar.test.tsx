/** @format */

// #region Imports NPM
import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { Toolbar, Popover, IconButton } from '@material-ui/core';
// #endregion
// #region Imports Local
import AppBar from '../components/app-bar';
// #endregion

describe('AppBar component', () => {
  const mockOpen = jest.fn();
  const props = { handleDrawerOpen: mockOpen };
  let component: ShallowWrapper;

  beforeAll(() => {
    component = shallow(<AppBar {...props} />);
  });

  it('match snapshot', () => {
    expect(component).toMatchSnapshot();
  });

  it('render component', () => {
    expect(component.find(AppBar)).toBeDefined();
  });

  it('find drawer icon', () => {
    expect(component.find(IconButton)).toBeDefined();
  });

  it('find Toolbar', () => {
    expect(component.find(Toolbar)).toBeDefined();
  });

  // it('find logo', () => {
  //   expect(component.find('img')).toHaveLength(1);
  // });

  it('find popover', () => {
    expect(component.find(Popover)).toBeDefined();
  });

  // it('simulate open', () => {
  //   component.find('#profile-avatar').simulate('click', {
  //     currentTarget: component.find('#profile-avatar'),
  //   });
  //   expect(component.state().anchorEl).toBeTruthy();
  // });
});
