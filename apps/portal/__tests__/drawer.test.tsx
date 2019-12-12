/** @format */

// #region Imports NPM
import React from 'react';
import { ShallowWrapper } from 'enzyme';
import { createShallow } from '@material-ui/core/test-utils';
// #endregion
// #region Imports Local
import Drawer from '../components/drawer';
import { ProfileContext } from '../lib/context';
import { MOCK_PROFILE } from '../lib/constants';
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
  const props = {
    open: false,
    isMobile: false,
    handleOpen: (): void => {},
    namespacesRequired: [],
  };
  const linkCount = 9;
  const linkAdminCount = 10;

  describe('Without context', () => {
    beforeAll(() => {
      component = createShallow({ dive: true })(<Drawer {...props} />);
    });

    it('match snapshot', () => {
      expect(component).toMatchSnapshot();
    });

    it('open correctly', () => {
      expect(component.find('WithStyles(ForwardRef(Drawer))').props().open).toEqual(props.open);
    });

    it('count links correctly', () => {
      expect(component.find('li')).toHaveLength(linkCount);
    });
  });

  // TODO: почему то контекст не пробрасывается
  // describe('With context', () => {
  //   beforeAll(() => {
  //     component = createShallow({ dive: true })(
  //       <ProfileContext.Provider value={MOCK_PROFILE}>
  //         <Drawer {...props} />
  //       </ProfileContext.Provider>,
  //     );
  //   });

  //   it('count links correctly', () => {
  //     expect(
  //       component
  //         .find('BaseDrawer')
  //         .dive()
  //         .find('li'),
  //     ).toHaveLength(linkAdminCount);
  //   });
  // });
});
