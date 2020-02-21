/** @format */

// #region Imports NPM
import React from 'react';
import { MockedProvider } from '@apollo/react-testing';
import { shallow as Shallow } from 'enzyme';
import { createShallow } from '@material-ui/core/test-utils';
import { Toolbar, Popover, IconButton } from '@material-ui/core';
// #endregion
// #region Imports Local
import AppBar from '../components/app-bar';
import { LOGOUT, SYNC } from '../lib/queries';
// #endregion

describe('AppBar component', () => {
  const mockOpen = jest.fn();
  const props = {
    open: true,
    anchorEl: null,
    handleDrawerOpen: mockOpen,
    handlePopoverOpen: mockOpen,
    handlePopoverClose: mockOpen,
    handleLogout: mockOpen,
  };
  let shallow: typeof Shallow;

  const mocks = [
    {
      request: {
        query: LOGOUT,
        variables: {},
      },
      result: {},
    },
    {
      request: {
        query: SYNC,
        variables: {},
      },
      result: {},
    },
  ];

  const Component = (
    <MockedProvider mocks={mocks} addTypename={false}>
      <AppBar {...props} />
    </MockedProvider>
  );

  beforeAll(() => {
    shallow = createShallow();
  });

  it('match snapshot', () => {
    const wrapper = shallow(Component);
    expect(wrapper).toMatchSnapshot();
  });

  it('render component', () => {
    const wrapper = shallow(Component);
    expect(wrapper.find(AppBar)).toBeDefined();
  });

  it('find drawer icon', () => {
    const wrapper = shallow(Component);
    expect(wrapper.find(IconButton)).toBeDefined();
  });

  it('find Toolbar', () => {
    const wrapper = shallow(Component);
    expect(wrapper.find(Toolbar)).toBeDefined();
  });

  it('find popover', () => {
    const wrapper = shallow(Component);
    expect(wrapper.find(Popover)).toBeDefined();
  });

  // it('simulate open', () => {
  //   component.find('#profile-avatar').simulate('click', {
  //     currentTarget: component.find('#profile-avatar'),
  //   });
  //   expect(component.state().anchorEl).toBeTruthy();
  // });
});
