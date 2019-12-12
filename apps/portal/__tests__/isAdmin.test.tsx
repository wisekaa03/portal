/** @format */

import { ShallowWrapper } from 'enzyme';
import { createShallow } from '@material-ui/core/test-utils';
import React from 'react';

import { ProfileContext } from '../lib/context';
import IsAdminComponent from '../components/isAdmin';
import { MOCK_PROFILE } from '../lib/constants';

describe('IsAdmin Component', () => {
  let component: ShallowWrapper;
  const props = {};

  beforeAll(() => {
    const child = <p>test</p>;

    component = createShallow()(
      <ProfileContext.Provider value={MOCK_PROFILE}>
        <IsAdminComponent {...props}>{child}</IsAdminComponent>
      </ProfileContext.Provider>,
    );
  });

  it('render correctly', () => {
    expect(component).toMatchSnapshot();
  });

  it('context correctly', () => {
    expect(component.find('p')).toHaveLength(1);
  });
});
