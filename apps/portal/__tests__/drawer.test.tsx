/** @format */

// #region Imports NPM
import React from 'react';
import { ShallowWrapper } from 'enzyme';
import { createShallow } from '@material-ui/core/test-utils';
import { Hidden } from '@material-ui/core';
// #endregion
// #region Imports Local
import Drawer from '../components/drawer';
// #endregion

jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '',
      query: '',
      asPath: '',
    };
  },
}));

describe('Drawer component', () => {
  let component: ShallowWrapper;
  const props = { open: false, handleOpen: (): void => {}, namespacesRequired: [] };

  beforeAll(() => {
    component = createShallow()(<Drawer {...props} />);
  });

  it('match snapshot', () => {
    expect(component).toMatchSnapshot();
  });

  it('render component', () => {
    expect(component.find(Drawer)).toBeDefined();
  });

  it('find Hidden', () => {
    expect(component.find(Hidden)).toBeDefined();
  });
});
