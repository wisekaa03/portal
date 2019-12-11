/** @format */

// #region Imports NPM
import React from 'react';
import { MockedProvider } from '@apollo/react-testing';
import { ShallowWrapper } from 'enzyme';
import { createShallow } from '@material-ui/core/test-utils';
import { Toolbar, Popover, IconButton } from '@material-ui/core';
// #endregion
// #region Imports Local
import AppBar from '../components/app-bar';
import { LOGOUT, SYNC } from '../lib/queries';
// #endregion

describe('AppBar component', () => {
  const mockOpen = jest.fn();
  const props = { handleDrawerOpen: mockOpen, namespacesRequired: [], t: jest.fn().mock };
  let component: ShallowWrapper;

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

  beforeAll(() => {
    component = createShallow()(
      <MockedProvider mocks={mocks} addTypename={false}>
        <AppBar {...props} />
      </MockedProvider>,
    );
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
