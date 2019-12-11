/** @format */

import { ShallowWrapper } from 'enzyme';
import { Button } from '@material-ui/core';
import { createShallow } from '@material-ui/core/test-utils';
import React from 'react';

import App from '../pages';

describe('App', () => {
  let component: ShallowWrapper;
  // let render: any;
  const props = {
    namespacesRequired: [],
    t: jest.fn().mock,
  };

  beforeAll(() => {
    component = createShallow()(<App {...props} />);
  });

  it('app: render correctly', () => {
    expect(component).toMatchSnapshot();
  });

  it('app page: Logout button', () => {
    expect(component.find(Button)).toBeDefined();
  });
});
