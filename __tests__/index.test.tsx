/** @format */

import { shallow } from 'enzyme';
import { Button } from '@material-ui/core';
import { createShallow } from '@material-ui/core/test-utils';
import React from 'react';

import App from '../pages';

describe('App', () => {
  let wrapperShallow: typeof shallow;
  // let render: any;
  const props = {
    namespacesRequired: [],
  };

  beforeAll(() => {
    wrapperShallow = createShallow();
  });

  it('app: render correctly', () => {
    const app = wrapperShallow(<App {...props} />);
    expect(app).toMatchSnapshot();
  });

  it('app page: Logout button', () => {
    const app = wrapperShallow(<App {...props} />);
    expect(app.find(Button)).toBeDefined();
  });
});
