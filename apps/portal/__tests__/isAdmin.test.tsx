/** @format */

import { shallow as Shallow } from 'enzyme';
import { createShallow } from '@material-ui/core/test-utils';
import React from 'react';

import { MOCK_PROFILE } from '@lib/constants';
import { ProfileContext } from '@lib/context';
import IsAdminComponent from '@front/components/isAdmin';

describe('IsAdmin Component', () => {
  let shallow: typeof Shallow;
  const props = {};
  const child = <p>test</p>;

  const Component = (
    <ProfileContext.Provider value={MOCK_PROFILE}>
      <IsAdminComponent {...props}>{child}</IsAdminComponent>
    </ProfileContext.Provider>
  );

  beforeAll(() => {
    shallow = createShallow();
  });

  it('render correctly', () => {
    const wrapper = shallow(Component);
    expect(wrapper).toMatchSnapshot();
  });

  it('context correctly', () => {
    const wrapper = shallow(Component);
    expect(wrapper.find('p')).toHaveLength(1);
  });
});
