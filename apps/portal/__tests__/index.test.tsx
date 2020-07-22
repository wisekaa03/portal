/** @format */

import { shallow as Shallow } from 'enzyme';
import { Button } from '@material-ui/core';
import { createShallow } from '@material-ui/core/test-utils';
import React from 'react';

import App from '@front/pages';

describe('Next.JS Front App', () => {
  let shallow: typeof Shallow;
  const props = {
    namespacesRequired: [],
  };

  beforeAll(() => {
    shallow = createShallow();
  });

  it('app: render correctly', () => {
    const wrapper = shallow(<App {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('app page: Logout button', () => {
    const wrapper = shallow(<App {...props} />);
    expect(wrapper.find(() => Button)).toBeDefined();
  });
});
